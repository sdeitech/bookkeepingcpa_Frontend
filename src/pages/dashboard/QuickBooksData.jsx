import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../../components/ui/select";
import { toast } from "sonner";


import {
    useGetQuickBooksConnectionStatusQuery,
    useGetQuickBooksAuthUrlMutation,
    useDisconnectQuickBooksMutation,
    useSyncQuickBooksDataMutation,
    useGetQuickBooksInvoicesQuery,
    useGetQuickBooksCustomersQuery,
    useGetQuickBooksExpensesQuery,
    useGetQuickBooksBalanceSheetQuery,
    useGetQuickBooksProfitLossQuery,
    useRefreshQuickBooksTokenMutation,
    useGetQuickBooksGeneralLedgerQuery,
} from "../../features/quickbooks/quickbooksApi";



import {
    Building2,
    Hash,
    Mail,
    DollarSign,
    MapPin,
    Clock,
    CalendarDays,
    CheckCircle2,
    FileText,
    Users,
    Receipt,
    BarChart3,
    RefreshCw,
    Link2,
    Unplug,
    Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const toLocalDateInputValue = (date) => {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offsetMs).toISOString().split("T")[0];
};

const getMonthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
        startDate: toLocalDateInputValue(start),
        endDate: toLocalDateInputValue(end),
    };
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(Number(amount || 0));
};

export default function QuickBooksData({ clientId = null, readOnly = false, showTitle = true }) {
    const navigate = useNavigate();
    const effectiveClientId = clientId || undefined;

    const today = useMemo(() => new Date(), []);
    const thisMonthRange = useMemo(() => getMonthRange(today), [today]);
    const lastMonthRange = useMemo(
        () => getMonthRange(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        [today]
    );
    const yearToDateRange = useMemo(() => {
        const start = new Date(today.getFullYear(), 0, 1);
        return {
            startDate: toLocalDateInputValue(start),
            endDate: toLocalDateInputValue(today),
        };
    }, [today]);

    const [dateRange, setDateRange] = useState({
        startDate: thisMonthRange.startDate,
        endDate: thisMonthRange.endDate,
    });
    const [quickRange, setQuickRange] = useState("thisMonth");


    const [appliedRange, setAppliedRange] = useState({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
    });


    const [activeTab, setActiveTab] = useState("invoices");
    const [selectedReport, setSelectedReport] = useState("profitLoss");

    const {
        data: invoicesData,
        isLoading: invoicesLoading,
        isFetching: invoicesFetching,
        error: invoicesError,
        refetch: refetchInvoices
    } = useGetQuickBooksInvoicesQuery(
        { startDate: appliedRange.startDate, endDate: appliedRange.endDate, clientId: effectiveClientId },
        { skip: activeTab !== 'invoices' }
    );

    const {
        data: customersData,
        isLoading: customersLoading,
        isFetching: customersFetching,
        error: customersError,
        refetch: refetchCustomers
    } = useGetQuickBooksCustomersQuery(
        { limit: 100, clientId: effectiveClientId },
        { skip: activeTab !== 'customers' }
    );

    const {
        data: expensesData,
        isLoading: expensesLoading,
        isFetching: expensesFetching,
        error: expensesError,
        refetch: refetchExpenses
    } = useGetQuickBooksExpensesQuery(
        { startDate: appliedRange.startDate, endDate: appliedRange.endDate, clientId: effectiveClientId },
        { skip: activeTab !== 'expenses' }
    );

    const {
        data: profitLossData,
        isLoading: profitLossLoading,
        isFetching: profitLossFetching,
        error: profitLossError
    } = useGetQuickBooksProfitLossQuery(
        { startDate: appliedRange.startDate, endDate: appliedRange.endDate, clientId: effectiveClientId },
        { skip: activeTab !== 'reports' || selectedReport !== 'profitLoss' }
    );

    const {
        data: balanceSheetData,
        isLoading: balanceSheetLoading,
        isFetching: balanceSheetFetching,
        error: balanceSheetError
    } = useGetQuickBooksBalanceSheetQuery(
        { startDate: appliedRange.startDate, endDate: appliedRange.endDate, clientId: effectiveClientId },
        { skip: activeTab !== 'reports' || selectedReport !== 'balanceSheet' }
    );


    const {
        data: generalLedgerData,
        isLoading: generalLedgerLoading,
        isFetching: generalLedgerFetching,
        error: generalLedgerError
    } = useGetQuickBooksGeneralLedgerQuery(
        { startDate: appliedRange.startDate, endDate: appliedRange.endDate, clientId: effectiveClientId },
        { skip: activeTab !== 'reports' || selectedReport !== 'generalLedger' }
    )


    const {
        data: connectionStatus,
        isLoading: qbLoading,
        isFetching: qbFetching,
    } = useGetQuickBooksConnectionStatusQuery(effectiveClientId);

    const [getAuthUrl] = useGetQuickBooksAuthUrlMutation();
    const [disconnectQuickBooks] = useDisconnectQuickBooksMutation();
    const [refreshQuickBooksToken, { isLoading: refreshLoading }] =
        useRefreshQuickBooksTokenMutation();





    // Same structure as QuickBooksIntegration
    const isConnected = connectionStatus?.data?.connected;
    const companyInfo = connectionStatus?.data;


    useEffect(() => {
        if (!readOnly && companyInfo?.tokenExpired) {
            refreshQuickBooksToken();
        }
    }, [companyInfo?.tokenExpired, refreshQuickBooksToken, readOnly]);


    const handleConnect = async () => {
        try {
            if (readOnly) return;
            const result = await getAuthUrl().unwrap();
            if (result?.data?.authUrl) {
                window.location.href = result.data.authUrl;
            }
        } catch (error) {
            toast.error("Failed to start QuickBooks connection.");
        }
    };

    const handleDisconnect = async () => {
        try {
            if (readOnly) return;
            await disconnectQuickBooks().unwrap();
            toast.success("QuickBooks disconnected.");
            navigate("/new-dashboard");
        } catch (error) {
            toast.error("Failed to disconnect QuickBooks.");
        }
    };

    const handleRefresh = async () => {
        try {
            if (readOnly) return;
            await refreshQuickBooksToken().unwrap();
            toast.success("QuickBooks connection refreshed.");
        } catch (error) {
            toast.error("Failed to refresh QuickBooks connection.");
        }
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
    };


    const [syncData, { isLoading: syncing }] = useSyncQuickBooksDataMutation();

    // Handle sync
    const handleSync = async () => {
        try {
            await syncData({ clientId: effectiveClientId }).unwrap();

            // Refetch data based on active tab
            switch (activeTab) {
                case 'invoices':
                    refetchInvoices();
                    break;
                case 'customers':
                    refetchCustomers();
                    break;
                case 'expenses':
                    refetchExpenses();
                    break;
                default:
                    break;
            }

            toast.success("QuickBooks data synced successfully.");
        } catch (error) {
            console.error('Sync failed:', error);
            toast.error("Failed to sync QuickBooks data. Please try again.");
        }
    };
  
    const getStatus = () => {
        if (companyInfo?.isPaused) return "paused";
        if (companyInfo?.tokenExpired) return "expired";
        return "active";
    };

    const status = getStatus();

    const statusStyles = {
        active: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
        paused: "bg-warning text-warning-foreground",
        expired: "bg-destructive text-destructive-foreground",
    };

    const invoices = invoicesData?.data?.invoices || [];
    const customers = customersData?.data?.customers || [];
    const expenses = expensesData?.data?.expenses || [];
    const invoicesLoaded = Boolean(invoicesData?.data);
    const customersLoaded = Boolean(customersData?.data);
    const expensesLoaded = Boolean(expensesData?.data);




    const profitLossReport = profitLossData?.data;
    const profitLossRows = profitLossReport?.Rows?.Row || [];
    const profitLossPeriod = profitLossReport?.Header?.StartPeriod && profitLossReport?.Header?.EndPeriod
        ? `${formatDate(profitLossReport.Header.StartPeriod)} to ${formatDate(profitLossReport.Header.EndPeriod)}`
        : `${formatDate(appliedRange.startDate)} to ${formatDate(appliedRange.endDate)}`;

    const balanceSheetReport = balanceSheetData?.data;
    const balanceSheetRows = balanceSheetReport?.Rows?.Row || [];
    const balanceSheetPeriod = balanceSheetReport?.Header?.EndPeriod
        ? `${formatDate(balanceSheetReport.Header.EndPeriod)}`
        : `${formatDate(appliedRange.endDate)}`;

    const generalLedgerReport = generalLedgerData?.data;
    const generalLedgerRows = generalLedgerReport?.Rows?.Row || [];
    const generalLedgerPeriod = generalLedgerReport?.Header?.StartPeriod && generalLedgerReport?.Header?.EndPeriod
        ? `${formatDate(generalLedgerReport.Header.StartPeriod)} to ${formatDate(generalLedgerReport.Header.EndPeriod)}`
        : `${formatDate(appliedRange.startDate)} to ${formatDate(appliedRange.endDate)}`;




    const isRangeDirty =
        dateRange.startDate !== appliedRange.startDate ||
        dateRange.endDate !== appliedRange.endDate;
    const isRangeValid =
        Boolean(dateRange.startDate) &&
        Boolean(dateRange.endDate) &&
        dateRange.startDate <= dateRange.endDate;

    const handleApplyRange = () => {
        if (!isRangeValid) {
            toast.error("Start date must be before end date.");
            return;
        }
        setAppliedRange(dateRange);
    };

    const quickRangeOptions = [
        { value: "thisMonth", label: "This month", range: thisMonthRange },
        { value: "lastMonth", label: "Last month", range: lastMonthRange },
        { value: "ytd", label: "Year to date", range: yearToDateRange },
    ];

    if (quickbooks.status !== "connected") {
        return (
            <div className={`animate-fade-in ${showTitle ? "space-y-6" : "space-y-4"}`}>
                {showTitle && (
                    <h1 className="text-2xl font-bold text-foreground">QuickBooks Data</h1>
                )}
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
                            <span className="text-success font-bold text-2xl">QB</span>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">QuickBooks Not Connected</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            {readOnly
                                ? "This client has not connected QuickBooks yet."
                                : "Connect your QuickBooks account from the dashboard to view your financial data here."}
                        </p>
                        {!readOnly && (
                            <Button onClick={quickbooks.connect} className="gap-2 mt-2">
                                <Link2 className="w-4 h-4" />
                                {quickbooks.status === "connecting" ? "Connecting..." : "Connect QuickBooks"}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className={`animate-fade-in ${showTitle ? "space-y-6" : "space-y-4"}`}>
            {showTitle && (
                <h1 className="text-2xl font-bold text-foreground">QuickBooks Data</h1>
            )}

            {/* Company Information */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Company Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                        <InfoRow icon={Building2} label="Company Name" value={companyInfo?.companyName || 'N/A'} />
                        <InfoRow icon={Hash} label="Company ID" value={companyInfo?.companyId || 'N/A'} />
                        <InfoRow icon={Mail} label="Email" value={companyInfo?.companyEmail || 'N/A'} />
                        <InfoRow icon={DollarSign} label="Currency" value={companyInfo?.baseCurrency || 'N/A'} />
                        <InfoRow icon={MapPin} label="Address" value={companyInfo?.companyAddress ?
                            `${companyInfo.companyAddress.city || ''}, ${companyInfo.companyAddress.state || ''} ${companyInfo.companyAddress.postalCode || ''}`.trim()
                            : 'N/A'} />
                        <InfoRow icon={Clock} label="Last Synced" value={formatDate(quickbooks.lastSynced) || "N/A"} />
                        <InfoRow icon={CalendarDays} label="Connected Since" value={formatDate(companyInfo.connectedSince) || 'N/A'} />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge className={`${statusStyles[status]} flex items-center`}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {status === "paused"
                                    ? "Paused"
                                    : status === "expired"
                                        ? "Token Expired"
                                        : "Active"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {!readOnly && (
                    <Button variant="destructive" className="gap-2" onClick={quickbooks.disconnect}>
                        <Unplug className="w-4 h-4" />
                        Disconnect QuickBooks
                    </Button>
                )}

                    <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
                        <div className="w-full sm:w-48">
                            <Select
                                value={quickRange}
                                onValueChange={(value) => {
                                    const match = quickRangeOptions.find((option) => option.value === value);
                                    if (match) {
                                        setDateRange(match.range);
                                        setQuickRange(match.value);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Quick range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {quickRangeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => {
                                    setDateRange({ ...dateRange, startDate: e.target.value });
                                    setQuickRange("custom");
                                }}
                                className="px-3 py-1.5 text-sm rounded-md border border-input bg-background"
                            />
                            <span className="text-muted-foreground text-sm">to</span>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => {
                                    setDateRange({ ...dateRange, endDate: e.target.value });
                                    setQuickRange("custom");
                                }}
                                className="px-3 py-1.5 text-sm rounded-md border border-input bg-background"
                            />
                            <Button
                                size="sm"
                                onClick={handleApplyRange}
                                disabled={!isRangeDirty || !isRangeValid}
                            >
                                Apply
                            </Button>
                        </div>
                        {!isRangeValid && (
                            <span className="text-xs text-destructive">Invalid date range</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {!readOnly && status === "expired" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshLoading}
                                className="gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshLoading ? "animate-spin" : ""}`} />
                                Refresh Connection
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSync}
                            disabled={syncing}
                            className="gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                            {syncing ? "Syncing..." : "Sync Now"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <SummaryCard
                        title="Invoices"
                        value={invoicesLoaded ? `${invoices.length} total` : "—"}
                        subValue={
                            invoicesLoaded
                                ? `Outstanding ${formatCurrency(
                                    invoices.reduce((sum, inv) => sum + Number(inv.Balance || 0), 0)
                                )}`
                                : "Open Invoices tab to load"
                        }
                        icon={FileText}
                    />
                    <SummaryCard
                        title="Customers"
                        value={customersLoaded ? `${customers.length} total` : "—"}
                        subValue={
                            customersLoaded
                                ? `${customers.filter((customer) => customer.Active).length} active`
                                : "Open Customers tab to load"
                        }
                        icon={Users}
                    />
                    <SummaryCard
                        title="Expenses"
                        value={expensesLoaded ? `${expenses.length} total` : "—"}
                        subValue={
                            expensesLoaded
                                ? `Total ${formatCurrency(
                                    expenses.reduce((sum, exp) => sum + Number(exp.TotalAmt || 0), 0)
                                )}`
                                : "Open Expenses tab to load"
                        }
                        icon={Receipt}
                    />
                </div>
            </div>


            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="invoices" className="gap-1.5">
                        <FileText className="w-4 h-4" /> Invoices
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="gap-1.5">
                        <Users className="w-4 h-4" /> Customers
                    </TabsTrigger>
                    <TabsTrigger value="expenses" className="gap-1.5">
                        <Receipt className="w-4 h-4" /> Expenses
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="gap-1.5">
                        <BarChart3 className="w-4 h-4" /> Reports
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="invoices">
                    <Card>
                        <CardContent className="py-6">
                            {invoicesLoading || invoicesFetching ? (
                                <p className="text-muted-foreground text-center">Loading invoices...</p>
                            ) : invoicesError ? (
                                <p className="text-red-500 text-center">
                                    Failed to load invoices.
                                </p>

                            ) : invoices?.length ? (
                                <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
                                    <table className="min-w-full text-sm text-foreground">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left text-muted-foreground uppercase text-[11px] tracking-wider">
                                                <th className="px-4 py-3">Invoice</th>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                                                <th className="px-4 py-3 whitespace-nowrap">Due Date</th>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">Amount</th>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">Balance</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-border">
                                            {invoices?.map((invoice) => {
                                                const isUnpaid = invoice.Balance > 0;

                                                return (
                                                    <tr
                                                        key={invoice.Id}
                                                        className="transition-colors hover:bg-muted/40 odd:bg-background even:bg-muted/20"
                                                    >
                                                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                                                            {invoice.DocNumber || "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {invoice.CustomerRef?.name || "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                            {formatDate(invoice.TxnDate)}
                                                        </td>

                                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                            {formatDate(invoice.DueDate)}
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                            {formatCurrency(invoice.TotalAmt)}
                                                        </td>

                                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                                            {formatCurrency(invoice.Balance)}
                                                        </td>

                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isUnpaid
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-green-100 text-green-700"
                                                                    }`}
                                                            >
                                                                {isUnpaid ? "Unpaid" : "Paid"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {invoices.length > 0 && (
                                                <tr className="bg-muted/70 font-semibold">
                                                    <td className="px-4 py-3">
                                                        Total ({invoices.length})
                                                    </td>

                                                    <td colSpan={3}></td>

                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        {formatCurrency(
                                                            invoices.reduce((sum, inv) => sum + Number(inv.TotalAmt || 0), 0)
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        {formatCurrency(
                                                            invoices.reduce((sum, inv) => sum + Number(inv.Balance || 0), 0)
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-center">—</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            ) : (
                                <PlaceholderTab label="Invoices" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="customers">
                    <Card>
                        <CardContent className="py-6">
                            {customersLoading || customersFetching ? (
                                <p className="text-muted-foreground text-center">Loading customers...</p>
                            ) : customersError ? (
                                <p className="text-red-500 text-center">
                                    Failed to load Customers.
                                </p>

                            ) : customers?.length ? (
                                <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
                                    <table className="min-w-full text-sm text-foreground">
                                        <thead className="bg-muted/60">
                                            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Company</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Phone</th>
                                                <th className="px-4 py-3 text-right whitespace-nowrap">Balance</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-border">
                                            {customers?.map((customer) => {
                                                const isActive = customer.Active;

                                                return (
                                                    <tr
                                                        key={customer.Id}
                                                        className="transition-colors hover:bg-muted/40 odd:bg-background even:bg-muted/20"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {customer.DisplayName || "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {customer.CompanyName || "-"}
                                                        </td>

                                                        <td className="px-4 py-3 text-muted-foreground break-all">
                                                            {customer.PrimaryEmailAddr?.Address || "-"}
                                                        </td>

                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {customer.PrimaryPhone?.FreeFormNumber || "-"}
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                            {formatCurrency(customer.Balance)}
                                                        </td>

                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-200 text-gray-600"
                                                                    }`}
                                                            >
                                                                {isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="bg-muted/70 font-semibold">
                                                <td className="px-4 py-3">
                                                    Total ({customers.length}) | Active ({customers.filter(c => c.Active).length})
                                                </td>

                                                <td colSpan={3}></td>

                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    {formatCurrency(
                                                        customers.reduce(
                                                            (sum, cust) => sum + Number(cust.Balance || 0),
                                                            0
                                                        )
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-center">—</td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>


                            ) : (
                                <PlaceholderTab label="Customers" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="expenses">
                    <Card>
                        <CardContent className="py-6">
                            {expensesLoading || expensesFetching ? (
                                <p className="text-muted-foreground text-center">Loading expenses...</p>
                            ) : expensesError ? (
                                <p className="text-red-500 text-center">
                                    Failed to load expenses.
                                </p>

                            ) : expenses?.length ? (
                                <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
                                    <table className="min-w-full text-sm text-foreground">

                                        {/* Header */}
                                        <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                                            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                <th className="px-5 py-3 whitespace-nowrap">Date</th>
                                                <th className="px-5 py-3">Vendor</th>
                                                <th className="px-5 py-3">Account</th>
                                                <th className="px-5 py-3">Description</th>
                                                <th className="px-5 py-3 text-right whitespace-nowrap">Amount</th>
                                                <th className="px-5 py-3 text-center whitespace-nowrap">Payment Method</th>
                                            </tr>
                                        </thead>

                                        {/* Body */}
                                        <tbody className="divide-y divide-border">
                                            {expenses?.map((expense) => {
                                                const isActive = expense.Active;
                                                const hasBalance = expense.Balance > 0;

                                                return (
                                                    <tr
                                                        key={expense.Id}
                                                        className="transition-colors hover:bg-muted/40 odd:bg-background even:bg-muted/20"
                                                    >
                                                        <td className="px-5 py-4 font-medium whitespace-nowrap">
                                                            {formatDate(expense.TxnDate)}
                                                        </td>

                                                        <td className="px-5 py-4 text-muted-foreground">
                                                            {expense.VendorName || expense.EntityRef?.name || '-'}
                                                        </td>

                                                        <td className="px-5 py-4 text-muted-foreground">
                                                            {expense.AccountRef?.name || '-'}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {expense.PrivateNote || expense.Line?.[0]?.Description || '-'}
                                                        </td>

                                                        <td
                                                            className="px-5 py-4 text-right font-semibold whitespace-nowrap"
                                                        >
                                                            {formatCurrency(expense.TotalAmt)}
                                                        </td>

                                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                                            {expense.PaymentType || '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="bg-muted/70 font-semibold">
                                                <td className="pl-12 py-3">
                                                    Total ({expenses.length})
                                                </td>
                                                <td colSpan={3}></td>
                                                <td className="pr-8 py-3 text-right whitespace-nowrap">
                                                    {formatCurrency(expenses.reduce((sum, exp) => sum + exp.TotalAmt, 0))}
                                                </td>

                                                <td className="pr-[6rem] py-3 text-right whitespace-nowrap">
                                                    Avg {formatCurrency(expenses.reduce((sum, exp) => sum + exp.TotalAmt, 0) / expenses.length)}
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>

                            ) : (
                                <PlaceholderTab label="Expenses" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reports">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Financial Reports
                                </CardTitle>
                                <div className="w-full sm:w-64">
                                    <Select value={selectedReport} onValueChange={setSelectedReport}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Report" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="profitLoss">Profit & Loss</SelectItem>
                                            <SelectItem value="balanceSheet">Balance Sheet</SelectItem>
                                            <SelectItem value="generalLedger">General Ledger</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4">
                                {selectedReport === "profitLoss" && (
                                    <>
                                        {profitLossLoading || profitLossFetching ? (
                                            <p className="text-muted-foreground text-center">
                                                Loading Profit & Loss Report...
                                            </p>
                                        ) : profitLossError ? (
                                            <p className="text-red-500 text-center">
                                                Failed to load report. Please try again.
                                            </p>
                                        ) : profitLossRows?.length ? (
                                            <div className="overflow-x-auto">
                                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span>
                                                        <span className="font-medium text-foreground">Period:</span>{" "}
                                                        {profitLossPeriod}
                                                    </span>
                                                </div>

                                                <div className="min-w-[600px]">
                                                    {renderReportRows(profitLossRows)}
                                                </div>
                                            </div>
                                        ) : (
                                            <PlaceholderTab label="Profit & Loss Report" />
                                        )}
                                    </>
                                )}

                                {selectedReport === "balanceSheet" && (
                                    <>
                                        {balanceSheetLoading || balanceSheetFetching ? (
                                            <p className="text-muted-foreground text-center">
                                                Loading Balance Sheet...
                                            </p>
                                        ) : balanceSheetError ? (
                                            <p className="text-red-500 text-center">
                                                Failed to load report. Please try again.
                                            </p>
                                        ) : balanceSheetRows?.length ? (
                                            <div className="overflow-x-auto">
                                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span>
                                                        <span className="font-medium text-foreground">  As of: </span>{balanceSheetPeriod}
                                                    </span>
                                                </div>

                                                <div className="min-w-[600px]">
                                                    {renderReportRows(balanceSheetRows)}
                                                </div>
                                            </div>
                                        ) : (
                                            <PlaceholderTab label="Balance Sheet Report" />
                                        )}
                                    </>
                                )}

                                {selectedReport === "generalLedger" && (
                                    <>
                                        {generalLedgerLoading || generalLedgerFetching ? (
                                            <p className="text-muted-foreground text-center">
                                                Loading General Ledger...
                                            </p>
                                        ) : generalLedgerError ? (
                                            <p className="text-red-500 text-center">
                                                Failed to load report. Please try again.
                                            </p>
                                        ) : generalLedgerRows?.length ? (
                                            <div className="overflow-x-auto">
                                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span>
                                                        <span className="font-medium text-foreground">Period:</span>{" "}
                                                        {generalLedgerPeriod}
                                                    </span>
                                                </div>

                                                <div className="min-w-[600px]">
                                                    {renderGeneralLegderReportRows(generalLedgerRows)}
                                                </div>
                                            </div>
                                        ) : (
                                            <PlaceholderTab label="General Ledger Report" />
                                        )}
                                    </>
                                )}

                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
                <span className="text-xs text-muted-foreground">{label}:</span>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

function PlaceholderTab({ label }) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No {label.toLowerCase()} data to display yet.</p>
            </CardContent>
        </Card>
    );
}

function SummaryCard({ title, value, subValue, icon: Icon }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-base font-semibold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{subValue}</p>
                </div>
            </CardContent>
        </Card>
    );
}


const extractLabelAmount = (colData = []) => ({
    label: colData?.[0]?.value || '',
    amount: colData?.[1]?.value || ''
});

const summaryDividerGroups = new Set([
    'GrossProfit',
    'NetOperatingIncome',
    'NetOtherIncome',
    'NetIncome'
]);

const formatMoneyValue = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return formatCurrency(numeric);
    return value;
};


const renderReportRows = (rows = [], depth = 0, keyPrefix = 'report') => {
    if (!Array.isArray(rows) || rows.length === 0) return null;

    return rows.flatMap((row, index) => {
        const items = [];
        const keyBase = `${keyPrefix}-${index}`;

        if (row?.Header?.ColData) {
            const { label, amount } = extractLabelAmount(row.Header.ColData);
            items.push(
                <div className="report-row section-header" key={`${keyBase}-header`}>
                    <span className="report-label" style={{ paddingLeft: `${depth * 16}px` }}>
                        {label}
                    </span>
                    <span className="amount">{formatMoneyValue(amount)}</span>
                </div>
            );
        }

        if (row?.Rows?.Row?.length) {
            items.push(
                ...renderReportRows(row.Rows.Row, depth + 1, `${keyBase}-rows`)
            );
        }

        if (row?.ColData) {
            const { label, amount } = extractLabelAmount(row.ColData);
            items.push(
                <div className="report-row" key={`${keyBase}-data`}>
                    <span className="report-label" style={{ paddingLeft: `${depth * 16}px` }}>
                        {label}
                    </span>
                    <span className="amount">{formatMoneyValue(amount)}</span>
                </div>
            );
        }

        if (row?.Summary?.ColData) {
            const { label, amount } = extractLabelAmount(row.Summary.ColData);
            const summaryClass = summaryDividerGroups.has(row.group) ? 'divider' : 'subtotal';
            items.push(
                <div className={`report-row ${summaryClass}`} key={`${keyBase}-summary`}>
                    <span className="report-label" style={{ paddingLeft: `${depth * 16}px` }}>
                        {label}
                    </span>
                    <span className="amount">{formatMoneyValue(amount)}</span>
                </div>
            );
        }

        return items;
    });
};

const renderGeneralLegderReportRows = (rows = [], depth = 0, keyPrefix = 'report') => {
    if (!Array.isArray(rows) || rows.length === 0) return null;

    return rows.flatMap((row, index) => {
        const items = [];
        const keyBase = `${keyPrefix}-${index}`;

        // Handle SECTION type rows
        if (row.type === "Section") {
            // Render section header if it exists
            if (row?.Header?.ColData) {
                const { label, amount } = extractLabelAmount(row.Header.ColData);

                items.push(
                    <div className="report-row section-header" key={`${keyBase}-header`}>
                        <span className="report-label" style={{ paddingLeft: `${depth * 16}px` }}>
                            {label}
                        </span>
                        <span className="amount">{formatMoneyValue(amount)}</span>
                    </div>
                );
            }

            // Render nested rows (both Data rows and nested Sections)
            if (row?.Rows?.Row?.length) {
                items.push(
                    ...renderGeneralLegderReportRows(row.Rows.Row, depth + 1, `${keyBase}-rows`)
                );
            }

            // Render summary after all nested content
            if (row?.Summary?.ColData) {
                const { label, amount } = extractLabelAmount(row.Summary.ColData);

                items.push(
                    <div className="report-row subtotal" key={`${keyBase}-summary`}>
                        <span className="report-label" style={{ paddingLeft: `${depth * 16}px` }}>
                            {label}
                        </span>
                        <span className="amount">{formatMoneyValue(amount)}</span>
                    </div>
                );
            }
        }
        // Handle DATA type rows (individual transactions)
        else if (row.type === "Data" && row?.ColData) {
            const { label, amount } = extractLabelAmount(row.ColData);

            items.push(
                <div className="report-row" key={`${keyBase}-data`}>
                    <span className="report-label" style={{ paddingLeft: `${depth * 16}px` }}>
                        {label}
                    </span>
                    <span className="amount">{formatMoneyValue(amount)}</span>
                </div>
            );
        }
        return items;
    });
};
