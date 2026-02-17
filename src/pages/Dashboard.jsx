import { useSearchParams, Outlet, useLocation } from "react-router-dom";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { AlertBanner } from "../components/dashboard/AlertBanner";
import { MetricCard } from "../components/dashboard/MetricCard";
import { OnboardingProgress } from "../components/dashboard/OnboardingProgress";
import { QuickBooksConnect } from "../components/dashboard/QuickBooksConnect";
import { Button } from "../components/ui/button";
import {
  useGetQuickBooksConnectionStatusQuery,
  useGetQuickBooksAuthUrlMutation,
  useDisconnectQuickBooksMutation,
  useSyncQuickBooksDataMutation,
  useLazyGetQuickBooksCashBalanceQuery,
  useGetQuickBooksCashBalanceQuery,
  useGetQuickBooksEssentialStatsQuery
} from "../features/quickbooks/quickbooksApi";

import {
  DollarSign,
  TrendingUp,
  Receipt,
  PiggyBank,
  Upload,
  FileText,
  Calendar,
  Phone,
  Mail,
  BarChart3,
  Target
} from "lucide-react";

import { Link } from "react-router-dom";
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import {useSelector } from "react-redux";

const onboardingSteps = [
  { id: "business-info", label: "Complete Business Information", completed: false },
  { id: "accounting-software", label: "Connect Accounting Software", completed: false },
  { id: "banking", label: "Link Bank Accounts", completed: false },
  { id: "payroll", label: "Set Up Payroll Integration", completed: false },
  { id: "documents", label: "Upload Required Documents", completed: false },
];






function DashboardHome() {
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const currentPlan = planParam || "essential";
  const {
    data: connectionStatus,
    isLoading: qbLoading,
    isFetching: qbFetching,
  } = useGetQuickBooksConnectionStatusQuery();

  const [getAuthUrl] = useGetQuickBooksAuthUrlMutation();
  const [disconnectQuickBooks] = useDisconnectQuickBooksMutation();
  const [syncQuickBooks] = useSyncQuickBooksDataMutation();



  // Same structure as QuickBooksIntegration
  const isConnected = connectionStatus?.data?.connected;
  const companyInfo = connectionStatus?.data;

  const { data, isLoading } =
    useGetQuickBooksCashBalanceQuery(undefined, {
      skip:
        !isConnected ||
        (
          companyInfo?.stats?.cashBalance != null &&
          companyInfo?.stats?.lastMonthRevenue != null
        )
    });


  const { data: essentialStats, refetch } =
    useGetQuickBooksEssentialStatsQuery(undefined, {
      skip: !isConnected || currentPlan !== "essential",
      refetchOnMountOrArgChange: true
    });




  const handleConnect = async () => {
    const result = await getAuthUrl().unwrap();
    if (result?.data?.authUrl) {
      window.location.href = result.data.authUrl;
    }
  };

  const handleDisconnect = async () => {
    await disconnectQuickBooks().unwrap();
  };

  const handleRefresh = async () => {
    await syncQuickBooks().unwrap();
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };


  const quickbooks = {
    status: isConnected
      ? "connected"
      : qbLoading || qbFetching
        ? "connecting"
        : "disconnected",

    companyName: companyInfo?.companyName ?? null,
    lastSynced: companyInfo?.lastSyncedAt ?? null,

    connect: handleConnect,
    disconnect: handleDisconnect,
    refresh: handleRefresh,
  };


  const planLabels = {
    startup: "Startup",
    essential: "Essential",
    enterprise: "Enterprise",
  };



  const formatCurrency = (amount = 0, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };
  const stats =
    essentialStats?.data?.stats ??
    data?.data?.stats ??
    companyInfo?.stats;


  const planConfigs = {
    startup: {
      metrics: [
        {
          title: "Cash Balance",
          value: stats?.cashBalance != null
            ? formatCurrency(stats.cashBalance)
            : "N/A",
          icon: DollarSign
        },
        {
          title: "Revenue Last Month",
          value: stats?.lastMonthRevenue != null
            ? formatCurrency(stats.lastMonthRevenue)
            : "N/A",
          icon: TrendingUp,
          change: { value: "Last Month" }
        },
      ],

      features: (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
          <div className="grid gap-3">
            <Link to="/dashboard/documents">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Upload className="w-5 h-5" />
                Upload Documents
              </Button>
            </Link>
            <Link to="/dashboard/support">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Mail className="w-5 h-5" />
                Submit Support Question
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
    essential: {
      metrics: [
        {
          title: "Revenue",
          value: stats?.revenue != null
            ? formatCurrency(stats.revenue)
            : "N/A",
          icon: DollarSign,
          change: { value: "This Month" }
        },
        {
          title: "Expenses",
          value: stats?.expenses != null
            ? formatCurrency(stats.expenses)
            : "N/A",
          icon: Receipt,
          change: { value: "This Month" }
        },
        {
          title: "Net Income",
          value: stats?.netIncome != null
            ? formatCurrency(stats.netIncome)
            : "N/A",
          icon: PiggyBank,
          change: { value: "This Month" }
        },
        {
          title: "Gross Margin", value: (stats?.grossMargin != null
            ? `${stats.grossMargin}%`
            : "N/A"

          ), icon: TrendingUp,
          change: { value: "This Month" }
        },
      ],
      features: (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Priority Actions</h3>
          <div className="grid gap-3">
            <Button className="w-full justify-start gap-3 h-12">
              <Calendar className="w-5 h-5" />
              Book Quarterly Strategy Call
            </Button>
            <Link to="/dashboard/documents">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Upload className="w-5 h-5" />
                Upload Documents
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <FileText className="w-5 h-5" />
              View Basic Reports
            </Button>
          </div>
        </div>
      ),
    },
    enterprise: {
      metrics: [
        { title: "Revenue", value: "$1,245,000", icon: DollarSign, change: { value: "+18%", type: "increase" } },
        { title: "Burn Rate", value: "$85,000/mo", icon: Receipt, change: { value: "-8%", type: "decrease" } },
        { title: "Cash Runway", value: "14 months", icon: PiggyBank, change: { value: "+2 mo", type: "increase" } },
        { title: "Forecast vs Actuals", value: "+4.2%", icon: Target, change: { value: "On track", type: "neutral" } },
      ],
      features: (
        <div className="space-y-6">
          <div className="bg-accent/50 border border-accent rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Your Dedicated CFO</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                SM
              </div>
              <div>
                <p className="font-medium text-foreground">Sarah Mitchell</p>
                <p className="text-sm text-muted-foreground">Senior CFO Partner</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button className="gap-2">
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Strategic Tools</h3>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <BarChart3 className="w-5 h-5" />
              Custom Reporting Dashboard
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Target className="w-5 h-5" />
              Forecasting Modules
            </Button>
          </div>
        </div>
      ),
    },
  };

  const planConfig = planConfigs[currentPlan];


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert Banner */}
      <AlertBanner
        message="Welcome! Please complete your Onboarding Checklist to initiate services."
        linkText="Complete Now"
        linkTo="/dashboard/onboarding"
      />

      {/* Plan Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Your Plan:</span>
        <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
          {planLabels[currentPlan]}
        </span>
      </div>

      {/* QuickBooks Connection - Priority */}
      <QuickBooksConnect
        status={quickbooks.status}
        onConnect={quickbooks.connect}
        onDisconnect={quickbooks.disconnect}
        onRefresh={quickbooks.refresh}
        lastSynced={formatDate(quickbooks.lastSynced)}
        companyName={quickbooks.companyName}
      />


      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planConfig.metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding Progress */}
        <div className="lg:col-span-2">
          <OnboardingProgress steps={onboardingSteps} currentStep={0} />
        </div>

        {/* Plan-specific Features */}
        <div className="bg-card border border-border rounded-xl p-6">
          {planConfig.features}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const isRootDashboard = location.pathname === "/new-dashboard";
  const user = useSelector(selectCurrentUser);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} logout={logout} />
        <main className="flex-1 p-6">
          {isRootDashboard ? <DashboardHome /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}


