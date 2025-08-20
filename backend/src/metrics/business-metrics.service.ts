import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class BusinessMetricsService {
  // Revenue Metrics
  private revenueCounter = new Counter({
    name: 'revenue_total',
    help: 'Total revenue generated',
    labelNames: ['payment_method', 'booking_type', 'region']
  });

  private averageOrderValue = new Histogram({
    name: 'average_order_value',
    help: 'Average order value distribution',
    labelNames: ['booking_type', 'duration'],
    buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
  });

  // User Engagement Metrics
  private userRegistrationCounter = new Counter({
    name: 'user_registration_total',
    help: 'Total user registrations',
    labelNames: ['user_type', 'source', 'verification_status']
  });

  private userLoginCounter = new Counter({
    name: 'user_login_total',
    help: 'Total user logins',
    labelNames: ['user_type', 'login_method']
  });

  private userRetentionGauge = new Gauge({
    name: 'user_retention_rate',
    help: 'User retention rate percentage',
    labelNames: ['cohort_month', 'user_type']
  });

  // Booking Metrics
  private bookingCreationCounter = new Counter({
    name: 'booking_created_total',
    help: 'Total bookings created',
    labelNames: ['status', 'booking_type', 'duration_category']
  });

  private bookingCompletionCounter = new Counter({
    name: 'booking_completed_total',
    help: 'Total bookings completed',
    labelNames: ['booking_type', 'completion_status']
  });

  private bookingCancellationCounter = new Counter({
    name: 'booking_cancelled_total',
    help: 'Total bookings cancelled',
    labelNames: ['cancellation_reason', 'user_type']
  });

  private bookingCreationDuration = new Histogram({
    name: 'booking_creation_duration_seconds',
    help: 'Time taken to create a booking',
    labelNames: ['booking_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
  });

  // Sitter Performance Metrics
  private sitterRatingGauge = new Gauge({
    name: 'sitter_rating_avg',
    help: 'Average sitter rating',
    labelNames: ['sitter_id', 'sitter_name', 'experience_level']
  });

  private sitterBookingCounter = new Counter({
    name: 'sitter_bookings_total',
    help: 'Total bookings per sitter',
    labelNames: ['sitter_id', 'sitter_name', 'booking_status']
  });

  private sitterEarningsCounter = new Counter({
    name: 'sitter_earnings_total',
    help: 'Total earnings per sitter',
    labelNames: ['sitter_id', 'sitter_name', 'payment_status']
  });

  // Customer Satisfaction Metrics
  private reviewRatingHistogram = new Histogram({
    name: 'review_rating_distribution',
    help: 'Distribution of review ratings',
    labelNames: ['booking_type', 'sitter_experience'],
    buckets: [1, 2, 3, 4, 5]
  });

  private reviewSubmissionCounter = new Counter({
    name: 'review_submitted_total',
    help: 'Total reviews submitted',
    labelNames: ['rating_category', 'booking_type']
  });

  private customerComplaintCounter = new Counter({
    name: 'customer_complaints_total',
    help: 'Total customer complaints',
    labelNames: ['complaint_type', 'severity', 'resolution_status']
  });

  // Support Metrics
  private supportTicketCounter = new Counter({
    name: 'support_tickets_created_total',
    help: 'Total support tickets created',
    labelNames: ['ticket_type', 'priority', 'user_type']
  });

  private supportTicketResolutionTime = new Histogram({
    name: 'support_ticket_resolution_time_hours',
    help: 'Time to resolve support tickets',
    labelNames: ['ticket_type', 'priority'],
    buckets: [1, 2, 4, 8, 24, 48, 72, 168]
  });

  private supportTicketResolvedCounter = new Counter({
    name: 'support_tickets_resolved_total',
    help: 'Total support tickets resolved',
    labelNames: ['ticket_type', 'resolution_method']
  });

  // Safety and Quality Metrics
  private incidentReportCounter = new Counter({
    name: 'incident_reports_total',
    help: 'Total incident reports',
    labelNames: ['incident_type', 'severity', 'location']
  });

  private safetyConcernCounter = new Counter({
    name: 'safety_concerns_total',
    help: 'Total safety concerns reported',
    labelNames: ['concern_type', 'severity', 'reported_by']
  });

  private positiveFeedbackCounter = new Counter({
    name: 'positive_feedback_total',
    help: 'Total positive feedback received',
    labelNames: ['feedback_type', 'booking_type']
  });

  // Payment Metrics
  private paymentProcessingCounter = new Counter({
    name: 'payment_processing_total',
    help: 'Total payment processing attempts',
    labelNames: ['payment_method', 'status', 'amount_range']
  });

  private paymentProcessingDuration = new Histogram({
    name: 'payment_processing_duration_seconds',
    help: 'Payment processing duration',
    labelNames: ['payment_method'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
  });

  private paymentSuccessCounter = new Counter({
    name: 'payment_success_total',
    help: 'Total successful payments',
    labelNames: ['payment_method', 'amount_range']
  });

  private paymentFailureCounter = new Counter({
    name: 'payment_failure_total',
    help: 'Total failed payments',
    labelNames: ['payment_method', 'failure_reason']
  });

  // Revenue tracking
  recordRevenue(amount: number, paymentMethod: string, bookingType: string, region: string) {
    this.revenueCounter.inc({ payment_method: paymentMethod, booking_type: bookingType, region });
    this.averageOrderValue.observe({ booking_type: bookingType, duration: 'single' }, amount);
  }

  // User engagement tracking
  recordUserRegistration(userType: string, source: string, verificationStatus: string) {
    this.userRegistrationCounter.inc({ user_type: userType, source, verification_status: verificationStatus });
  }

  recordUserLogin(userType: string, loginMethod: string) {
    this.userLoginCounter.inc({ user_type: userType, login_method: loginMethod });
  }

  setUserRetentionRate(cohortMonth: string, userType: string, rate: number) {
    this.userRetentionGauge.set({ cohort_month: cohortMonth, user_type: userType }, rate);
  }

  // Booking tracking
  recordBookingCreation(status: string, bookingType: string, durationCategory: string, duration: number) {
    this.bookingCreationCounter.inc({ status, booking_type: bookingType, duration_category: durationCategory });
    this.bookingCreationDuration.observe({ booking_type: bookingType }, duration);
  }

  recordBookingCompletion(bookingType: string, completionStatus: string) {
    this.bookingCompletionCounter.inc({ booking_type: bookingType, completion_status: completionStatus });
  }

  recordBookingCancellation(reason: string, userType: string) {
    this.bookingCancellationCounter.inc({ cancellation_reason: reason, user_type: userType });
  }

  // Sitter performance tracking
  setSitterRating(sitterId: string, sitterName: string, experienceLevel: string, rating: number) {
    this.sitterRatingGauge.set({ sitter_id: sitterId, sitter_name: sitterName, experience_level: experienceLevel }, rating);
  }

  recordSitterBooking(sitterId: string, sitterName: string, status: string) {
    this.sitterBookingCounter.inc({ sitter_id: sitterId, sitter_name: sitterName, booking_status: status });
  }

  recordSitterEarnings(sitterId: string, sitterName: string, paymentStatus: string, amount: number) {
    this.sitterEarningsCounter.inc({ sitter_id: sitterId, sitter_name: sitterName, payment_status: paymentStatus });
  }

  // Customer satisfaction tracking
  recordReviewRating(bookingType: string, sitterExperience: string, rating: number) {
    this.reviewRatingHistogram.observe({ booking_type: bookingType, sitter_experience: sitterExperience }, rating);
  }

  recordReviewSubmission(ratingCategory: string, bookingType: string) {
    this.reviewSubmissionCounter.inc({ rating_category: ratingCategory, booking_type: bookingType });
  }

  recordCustomerComplaint(complaintType: string, severity: string, resolutionStatus: string) {
    this.customerComplaintCounter.inc({ complaint_type: complaintType, severity, resolution_status: resolutionStatus });
  }

  // Support tracking
  recordSupportTicket(ticketType: string, priority: string, userType: string) {
    this.supportTicketCounter.inc({ ticket_type: ticketType, priority, user_type: userType });
  }

  recordSupportTicketResolution(ticketType: string, priority: string, resolutionTime: number) {
    this.supportTicketResolutionTime.observe({ ticket_type: ticketType, priority }, resolutionTime);
  }

  recordSupportTicketResolved(ticketType: string, resolutionMethod: string) {
    this.supportTicketResolvedCounter.inc({ ticket_type: ticketType, resolution_method: resolutionMethod });
  }

  // Safety and quality tracking
  recordIncidentReport(incidentType: string, severity: string, location: string) {
    this.incidentReportCounter.inc({ incident_type: incidentType, severity, location });
  }

  recordSafetyConcern(concernType: string, severity: string, reportedBy: string) {
    this.safetyConcernCounter.inc({ concern_type: concernType, severity, reported_by: reportedBy });
  }

  recordPositiveFeedback(feedbackType: string, bookingType: string) {
    this.positiveFeedbackCounter.inc({ feedback_type: feedbackType, booking_type: bookingType });
  }

  // Payment tracking
  recordPaymentProcessing(paymentMethod: string, status: string, amountRange: string, duration: number) {
    this.paymentProcessingCounter.inc({ payment_method: paymentMethod, status, amount_range: amountRange });
    this.paymentProcessingDuration.observe({ payment_method: paymentMethod }, duration);
  }

  recordPaymentSuccess(paymentMethod: string, amountRange: string) {
    this.paymentSuccessCounter.inc({ payment_method: paymentMethod, amount_range: amountRange });
  }

  recordPaymentFailure(paymentMethod: string, failureReason: string) {
    this.paymentFailureCounter.inc({ payment_method: paymentMethod, failure_reason: failureReason });
  }
}
