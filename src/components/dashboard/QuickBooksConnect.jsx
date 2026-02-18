import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle2, Link2, RefreshCw, AlertCircle } from "lucide-react";





export function QuickBooksConnect({
  status,
  onConnect,
  onDisconnect,
  onRefresh,
  lastSynced,
  companyName,
}) {
  const statusConfig= {
    disconnected: { label: "Not Connected", variant: "secondary" },
    connecting: { label: "Connecting...", variant: "outline" },
    connected: { label: "Connected", variant: "default" },
    error: { label: "Connection Error", variant: "destructive" },
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2CA01C] flex items-center justify-center">
              <span className="text-white font-bold text-sm">QB</span>
            </div>
            <div>
              <CardTitle className="text-lg">QuickBooks Online</CardTitle>
              <CardDescription>
                {companyName || "Connect your accounting software"}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusConfig[status].variant}>
            {status === "connected" && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {status === "error" && <AlertCircle className="w-3 h-3 mr-1" />}
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {status === "connected" ? (
          <div className="space-y-4">
            {lastSynced && (
              <p className="text-sm text-muted-foreground">
                Last synced: {lastSynced}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="text-muted-foreground hover:text-destructive"
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              Unable to connect to QuickBooks. Please try again.
            </p>
            <Button onClick={onConnect} className="gap-2">
              <Link2 className="w-4 h-4" />
              Retry Connection
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect QuickBooks to sync your financial data automatically.
            </p>
            <Button
              onClick={onConnect}
              disabled={status === "connecting"}
              className="gap-2"
            >
              <Link2 className="w-4 h-4" />
              {status === "connecting" ? "Connecting..." : "Connect QuickBooks"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
