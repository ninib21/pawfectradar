import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { analyticsService } from '../../shared/api/analyticsService';
import { QuantumCard } from '../QuantumCard';
import { QuantumButton } from '../QuantumButton';

interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    retentionRate: number;
  };
  bookingMetrics: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating: number;
    revenue: number;
  };
  aiMetrics: {
    trustScoreAccuracy: number;
    matchmakingSuccess: number;
    sentimentAccuracy: number;
    smartBookingAdoption: number;
  };
  performanceMetrics: {
    appLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    crashRate: number;
  };
  timeSeriesData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
    }>;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'ai' | 'performance'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data from the service
      const data = await analyticsService.getAnalytics(timeRange);
      setAnalyticsData(data);
      
      // Track dashboard view
      analyticsService.trackEvent('analytics_dashboard_viewed', {
        timeRange,
        tab: activeTab
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, trend?: number) => (
    <QuantumCard key={title} style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      {trend !== undefined && (
        <Text style={[styles.trend, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}>
          {trend >= 0 ? '+' : ''}{trend}%
        </Text>
      )}
    </QuantumCard>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Key Metrics</Text>
      <View style={styles.metricsGrid}>
        {analyticsData?.userMetrics && (
          <>
            {renderMetricCard('Total Users', analyticsData.userMetrics.totalUsers.toLocaleString())}
            {renderMetricCard('Active Users', analyticsData.userMetrics.activeUsers.toLocaleString())}
            {renderMetricCard('New Users', analyticsData.userMetrics.newUsers.toLocaleString())}
            {renderMetricCard('Retention Rate', `${analyticsData.userMetrics.retentionRate}%`)}
          </>
        )}
      </View>

      <Text style={styles.sectionTitle}>Revenue & Bookings</Text>
      <View style={styles.metricsGrid}>
        {analyticsData?.bookingMetrics && (
          <>
            {renderMetricCard('Total Revenue', `$${analyticsData.bookingMetrics.revenue.toLocaleString()}`)}
            {renderMetricCard('Total Bookings', analyticsData.bookingMetrics.totalBookings.toLocaleString())}
            {renderMetricCard('Completion Rate', `${((analyticsData.bookingMetrics.completedBookings / analyticsData.bookingMetrics.totalBookings) * 100).toFixed(1)}%`)}
            {renderMetricCard('Avg Rating', analyticsData.bookingMetrics.averageRating.toFixed(1)})
          </>
        )}
      </View>

      {analyticsData?.timeSeriesData && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>User Growth</Text>
          <LineChart
            data={analyticsData.timeSeriesData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1E293B',
              backgroundGradientFrom: '#1E293B',
              backgroundGradientTo: '#334155',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}
    </View>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>User Demographics</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={[
            {
              name: 'Pet Owners',
              population: 65,
              color: '#3B82F6',
              legendFontColor: '#FFFFFF',
            },
            {
              name: 'Pet Sitters',
              population: 35,
              color: '#10B981',
              legendFontColor: '#FFFFFF',
            },
          ]}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      <Text style={styles.sectionTitle}>User Activity</Text>
      <View style={styles.metricsGrid}>
        {renderMetricCard('Daily Active Users', '1,234')}
        {renderMetricCard('Weekly Active Users', '8,567')}
        {renderMetricCard('Monthly Active Users', '23,456')}
        {renderMetricCard('Session Duration', '12.5 min')}
      </View>
    </View>
  );

  const renderBookingsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Booking Trends</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43, 50],
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1E293B',
            backgroundGradientFrom: '#1E293B',
            backgroundGradientTo: '#334155',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>

      <Text style={styles.sectionTitle}>Booking Performance</Text>
      <View style={styles.metricsGrid}>
        {renderMetricCard('Success Rate', '94.2%')}
        {renderMetricCard('Avg Booking Value', '$45.67')}
        {renderMetricCard('Peak Hours', '6-8 PM')}
        {renderMetricCard('Popular Services', 'Dog Walking')}
      </View>
    </View>
  );

  const renderAITab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>AI Performance</Text>
      <View style={styles.metricsGrid}>
        {analyticsData?.aiMetrics && (
          <>
            {renderMetricCard('Trust Score Accuracy', `${analyticsData.aiMetrics.trustScoreAccuracy}%`)}
            {renderMetricCard('Matchmaking Success', `${analyticsData.aiMetrics.matchmakingSuccess}%`)}
            {renderMetricCard('Sentiment Accuracy', `${analyticsData.aiMetrics.sentimentAccuracy}%`)}
            {renderMetricCard('Smart Booking Adoption', `${analyticsData.aiMetrics.smartBookingAdoption}%`)}
          </>
        )}
      </View>

      <Text style={styles.sectionTitle}>AI Insights</Text>
      <View style={styles.insightsContainer}>
        <QuantumCard style={styles.insightCard}>
          <Text style={styles.insightTitle}>Top Performing Features</Text>
          <Text style={styles.insightText}>• Trust Score Model: 94% accuracy</Text>
          <Text style={styles.insightText}>• Smart Booking: 23% time savings</Text>
          <Text style={styles.insightText}>• Matchmaking: 87% satisfaction rate</Text>
        </QuantumCard>
      </View>
    </View>
  );

  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>App Performance</Text>
      <View style={styles.metricsGrid}>
        {analyticsData?.performanceMetrics && (
          <>
            {renderMetricCard('App Load Time', `${analyticsData.performanceMetrics.appLoadTime}ms`)}
            {renderMetricCard('API Response Time', `${analyticsData.performanceMetrics.apiResponseTime}ms`)}
            {renderMetricCard('Error Rate', `${analyticsData.performanceMetrics.errorRate}%`)}
            {renderMetricCard('Crash Rate', `${analyticsData.performanceMetrics.crashRate}%`)}
          </>
        )}
      </View>

      <Text style={styles.sectionTitle}>Performance Trends</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                data: [1200, 1100, 1300, 1000, 900, 1400, 1200],
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1E293B',
            backgroundGradientFrom: '#1E293B',
            backgroundGradientTo: '#334155',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'users':
        return renderUsersTab();
      case 'bookings':
        return renderBookingsTab();
      case 'ai':
        return renderAITab();
      case 'performance':
        return renderPerformanceTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <View style={styles.controls}>
          <View style={styles.timeRangeButtons}>
            {(['7d', '30d', '90d'] as const).map((range) => (
              <QuantumButton
                key={range}
                variant={timeRange === range ? 'primary' : 'outline'}
                size="small"
                onPress={() => setTimeRange(range)}
                style={styles.timeButton}
              >
                {range}
              </QuantumButton>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        {(['overview', 'users', 'bookings', 'ai', 'performance'] as const).map((tab) => (
          <QuantumButton
            key={tab}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="small"
            onPress={() => setActiveTab(tab)}
            style={styles.tabButton}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </QuantumButton>
        ))}
      </View>

      {renderTabContent()}

      <View style={styles.footer}>
        <QuantumButton
          variant="outline"
          onPress={loadAnalyticsData}
          style={styles.refreshButton}
        >
          Refresh Data
        </QuantumButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    minWidth: 50,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    marginRight: 8,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    padding: 15,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  trend: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginVertical: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    marginTop: 20,
  },
  insightCard: {
    padding: 15,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  refreshButton: {
    minWidth: 120,
  },
});
