import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
import {
  User,
  Building2,
  FileText,
  MessageCircle,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Dashboard Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back! Here's what's happening with your hiring.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Job Posting
              </button>
              <button className="text-gray-600 hover:text-gray-900 p-2">
                <Bell className="w-6 h-6" />
              </button>
              <button className="text-gray-600 hover:text-gray-900 p-2">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Active Jobs",
                value: "12",
                change: "+2",
                icon: FileText,
                color: "text-blue-600",
                bgColor: "bg-blue-100",
              },
              {
                title: "Total Applications",
                value: "1,247",
                change: "+15%",
                icon: Users,
                color: "text-green-600",
                bgColor: "bg-green-100",
              },
              {
                title: "Interviews Conducted",
                value: "89",
                change: "+8",
                icon: MessageCircle,
                color: "text-purple-600",
                bgColor: "bg-purple-100",
              },
              {
                title: "Hires This Month",
                value: "5",
                change: "+2",
                icon: Target,
                color: "text-orange-600",
                bgColor: "bg-orange-100",
              },
            ].map((stat, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.title}</div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Activity
                  </h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      type: "application",
                      title: "New application for Senior Developer",
                      candidate: "John Smith",
                      time: "2 hours ago",
                      status: "pending",
                    },
                    {
                      type: "interview",
                      title: "AI Interview completed",
                      candidate: "Sarah Johnson",
                      time: "4 hours ago",
                      status: "completed",
                    },
                    {
                      type: "job",
                      title: "Job posting published",
                      candidate: "Marketing Manager",
                      time: "1 day ago",
                      status: "active",
                    },
                    {
                      type: "hire",
                      title: "Candidate hired",
                      candidate: "Mike Chen",
                      time: "2 days ago",
                      status: "hired",
                    },
                  ].map((activity, index) => (
                    <MotionWrapper
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {activity.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {activity.candidate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {activity.time}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            activity.status === "pending"
                              ? "bg-accent-100 text-accent-800"
                              : activity.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : activity.status === "active"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {activity.status}
                        </div>
                      </div>
                    </MotionWrapper>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Analytics */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Plus className="w-5 h-5 mr-3 text-primary-600" />
                    <span>Create Job Posting</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Search className="w-5 h-5 mr-3 text-primary-600" />
                    <span>Search Candidates</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <MessageCircle className="w-5 h-5 mr-3 text-primary-600" />
                    <span>Schedule Interview</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <BarChart3 className="w-5 h-5 mr-3 text-primary-600" />
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Hiring Success Rate
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      95%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "95%" }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time to Hire</span>
                    <span className="text-sm font-semibold text-gray-900">
                      12 days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "80%" }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Candidate Satisfaction
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      4.8/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: "96%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Upcoming Interviews */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Upcoming Interviews
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      time: "10:00 AM",
                      candidate: "Alex Thompson",
                      role: "Frontend Developer",
                    },
                    {
                      time: "2:00 PM",
                      candidate: "Lisa Wang",
                      role: "Product Manager",
                    },
                    {
                      time: "4:30 PM",
                      candidate: "David Kim",
                      role: "Backend Developer",
                    },
                  ].map((interview, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {interview.candidate}
                        </div>
                        <div className="text-sm text-gray-600">
                          {interview.role}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {interview.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
