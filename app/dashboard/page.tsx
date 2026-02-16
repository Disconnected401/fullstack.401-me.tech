"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-components";
import { DashboardStats, Ad, ChartData, User } from "@/lib/types";
import { TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye, Target, Plus, Menu, LogOut, Info } from "lucide-react";
import AddAdForm from "@/components/add-ad-form";

// Union type for stat cards
type StatCardType = "impressions" | "clicks" | "conversions" | "cost";

// Intersection type example
type StatsWithUser = DashboardStats & { user: User };

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddAdOpen, setIsAddAdOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr) as User;
    setUser(userData);

    // Fetch dashboard data
    fetchDashboardData(userData.id);
    fetchAds(userData.id);
  }, [router]);

  async function fetchDashboardData(userId: number) {
    try {
      const response = await fetch(`/api/stats?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setChartData(data.chartData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAds(userId: number) {
    try {
      const response = await fetch(`/api/ads?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("user");
    router.push("/login");
  }

  function handleAddAdSuccess() {
    setIsAddAdOpen(false);
    if (user) {
      fetchAds(user.id);
      fetchDashboardData(user.id);
    }
  }

  const chartConfig = {
    impressions: {
      label: "Impressions",
      color: "hsl(var(--chart-1))",
    },
    clicks: {
      label: "Clicks",
      color: "hsl(var(--chart-2))",
    },
    conversions: {
      label: "Conversions",
      color: "hsl(var(--chart-3))",
    },
    cost: {
      label: "Cost",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000814]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">
                AdReport
              </h1>
            </div>

            <div className="flex items-center gap-4 group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsAddAdOpen(true)}
                      className="bg-white text-black hover:bg-white/90 active:scale-95 transition-all"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Ad
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new ad campaign</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="hover:bg-accent transition-colors">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user?.username}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-white focus:text-white">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow duration-300 group hover:scale-105 transform border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-white" />
                CTR: {stats.ctr.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group hover:scale-105 transform border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.costPerClick.toFixed(2)} per click
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group hover:scale-105 transform border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-white" />
                {stats.conversionRate.toFixed(2)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group hover:scale-105 transform border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.costPerConversion.toFixed(2)} per conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-white/20">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Impressions and Clicks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-impressions)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-impressions)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-clicks)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-clicks)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="impressions"
                    type="natural"
                    fill="url(#fillImpressions)"
                    fillOpacity={0.4}
                    stroke="var(--color-impressions)"
                    stackId="a"
                  />
                  <Area
                    dataKey="clicks"
                    type="natural"
                    fill="url(#fillClicks)"
                    fillOpacity={0.4}
                    stroke="var(--color-clicks)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-white/20">
            <CardHeader>
              <CardTitle>Conversions & Cost</CardTitle>
              <CardDescription>Daily conversions and spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="conversions"
                    fill="var(--color-conversions)"
                    radius={4}
                  />
                  <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ads Table */}
        <Card className="hover:shadow-lg transition-shadow duration-300 border-white/20">
          <CardHeader>
            <CardTitle>Your Ad Campaigns</CardTitle>
            <CardDescription>
              Manage and monitor your advertising campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow
                    key={ad.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAd(ad)}
                  >
                    <TableCell className="font-medium">{ad.campaign_name}</TableCell>
                    <TableCell>{ad.platform}</TableCell>
                    <TableCell>{ad.ad_type}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ad.status === "active"
                            ? "bg-white/20 text-white border border-white/30"
                            : ad.status === "paused"
                            ? "bg-white/10 text-white/70 border border-white/20"
                            : ad.status === "completed"
                            ? "bg-white/5 text-white/50 border border-white/10"
                            : "bg-white/10 text-white/60 border border-white/20"
                        }`}
                      >
                        {ad.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${ad.budget.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{ad.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{ad.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{ad.conversions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${ad.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Add Ad Dialog */}
      <Dialog open={isAddAdOpen} onOpenChange={setIsAddAdOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Ad Campaign</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new advertising campaign
            </DialogDescription>
          </DialogHeader>
          {user && <AddAdForm userId={user.id} onSuccess={handleAddAdSuccess} />}
        </DialogContent>
      </Dialog>

      {/* Ad Details Dialog */}
      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAd?.campaign_name}</DialogTitle>
            <DialogDescription>Campaign Details</DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platform</p>
                  <p className="text-base font-semibold">{selectedAd.platform}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ad Type</p>
                  <p className="text-base font-semibold">{selectedAd.ad_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-base font-semibold">${selectedAd.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-base font-semibold capitalize">{selectedAd.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-base font-semibold">{selectedAd.start_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                  <p className="text-base font-semibold">{selectedAd.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                  <p className="text-base font-semibold">{selectedAd.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                  <p className="text-base font-semibold">{selectedAd.conversions.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target Audience</p>
                <p className="text-base">{selectedAd.target_audience}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
