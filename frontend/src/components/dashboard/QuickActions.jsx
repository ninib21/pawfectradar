import { Card as CardIcon, CardContent as CardContentIcon, CardHeader as CardHeaderIcon, CardTitle as CardTitleIcon } from '@/lib/icons.js';

import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions({ user }) {
  const ownerActions = [
    {
      title: "Add New Pet",
      description: "Register a new furry friend",
      icon: Plus,
      link: createPageUrl("Pets"),
      color: "from-[#A2D4F5] to-[#7DB9E8]"
    },
    {
      title: "Find Sitters",
      description: "Discover trusted pet sitters nearby",
      icon: Search,
      link: createPageUrl("Sitters"),
      color: "from-[#FBC3D2] to-[#F8A7C0]"
    },
    {
      title: "Book Service",
      description: "Schedule pet care for your pets",
      icon: Calendar,
      link: createPageUrl("Bookings"),
      color: "from-purple-400 to-purple-600"
    }
  ];

  const sitterActions = [
    {
      title: "Update Availability",
      description: "Manage your schedule",
      icon: Calendar,
      link: createPageUrl("Profile"),
      color: "from-green-400 to-green-600"
    },
    {
      title: "View Requests",
      description: "Check new booking requests",
      icon: User,
      link: createPageUrl("Bookings"),
      color: "from-orange-400 to-orange-600"
    }
  ];

  const actions = user?.user_type === 'sitter' ? sitterActions : ownerActions;

  return (
    <CardIcon className="shadow-lg border-0">
      <CardHeaderIcon>
        <CardTitleIcon className="flex items-center gap-2 text-xl">
          Quick Actions
        </CardTitleIcon>
      </CardHeaderIcon>
      <CardContentIcon>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Link key={index} to={action.link}>
              <div className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContentIcon>
    </CardIcon>
  );
}