
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, MessageSquare, TrendingUp } from 'lucide-react';

interface AnalyticsDashboardProps {
    stats: {
        totalUsers: number;
        totalConversations: number;
        totalTraining: number;
    };
    activityData?: any[]; // For Area Chart
    userData?: any[]; // For Bar Chart
    categoryData?: any[]; // For Pie Chart
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

// Mock Data fallback
const mockActivityData = [
    { name: 'Lun', messages: 40, visitors: 24 },
    { name: 'Mar', messages: 30, visitors: 13 },
    { name: 'Mie', messages: 20, visitors: 98 },
    { name: 'Jue', messages: 27, visitors: 39 },
    { name: 'Vie', messages: 18, visitors: 48 },
    { name: 'Sab', messages: 23, visitors: 38 },
    { name: 'Dom', messages: 34, visitors: 43 },
];

const mockCategoryData = [
    { name: 'Fe', value: 400 },
    { name: 'Oración', value: 300 },
    { name: 'Biblia', value: 300 },
    { name: 'Consejería', value: 200 },
];

export const AnalyticsDashboard = ({ stats }: AnalyticsDashboardProps) => {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Usuarios</p>
                            <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
                            <p className="text-xs text-green-400 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> +12% vs mes anterior
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Conversaciones</p>
                            <h3 className="text-2xl font-bold mt-1">{stats.totalConversations}</h3>
                            <p className="text-xs text-green-400 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> +5% diaria
                            </p>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Base Conocimiento</p>
                            <h3 className="text-2xl font-bold mt-1">{stats.totalTraining}</h3>
                            <p className="text-xs text-gray-500 mt-1">Entradas activas</p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <Activity className="w-6 h-6 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600 to-blue-600 border-none text-white shadow-lg shadow-purple-900/40">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-indigo-100 mb-1">Estado del Sistema</p>
                        <h3 className="text-xl font-bold mb-3">En Línea coorrectamente</h3>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/50 w-[98%] animate-pulse" />
                        </div>
                        <p className="text-xs mt-2 text-indigo-100 opacity-80">Ping: 24ms</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardHeader>
                        <CardTitle>Actividad de Mensajes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockActivityData}>
                                <defs>
                                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2f39" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="messages" stroke="#8884d8" fillOpacity={1} fill="url(#colorMessages)" />
                                <Area type="monotone" dataKey="visitors" stroke="#82ca9d" fillOpacity={1} fill="url(#colorVisitors)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardHeader>
                        <CardTitle>Temas Populares</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {mockCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                {/* Custom Legend could go here */}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-400">
                            {mockCategoryData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1">
                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardHeader>
                        <CardTitle>Usuarios Nuevos vs Recurrentes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockActivityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2f39" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                <Bar dataKey="messages" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="visitors" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
