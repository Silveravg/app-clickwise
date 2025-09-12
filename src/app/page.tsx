"use client";

import { useState, useEffect } from 'react';
import { Plus, BarChart3, Download, MessageSquare, TrendingUp, Target, DollarSign, Eye, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Campaign, Recommendation, DashboardData, Feedback } from '@/lib/types';
import { calculateMetrics, generateRecommendations, formatCurrency, formatNumber, formatPercentage, getPlatformColor, getImpactColor } from '@/lib/utils';

export default function ClickWise() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Form states
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: '',
    budget: '',
    spent: '',
    clicks: '',
    impressions: '',
    targetAudience: '',
    startDate: '',
    endDate: ''
  });

  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    category: 'general'
  });

  useEffect(() => {
    // Load sample data
    const sampleCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Promoção Black Friday',
        platform: 'facebook',
        budget: 5000,
        spent: 3200,
        clicks: 1250,
        impressions: 45000,
        targetAudience: 'Mulheres 25-45, interessadas em moda',
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        status: 'active'
      },
      {
        id: '2',
        name: 'Lançamento Produto',
        platform: 'google',
        budget: 3000,
        spent: 2800,
        clicks: 890,
        impressions: 28000,
        targetAudience: 'Homens 30-50, renda alta',
        startDate: '2024-10-15',
        endDate: '2024-12-15',
        status: 'active'
      }
    ];
    setCampaigns(sampleCampaigns);
    calculateDashboardData(sampleCampaigns);
  }, []);

  const calculateDashboardData = (campaignList: Campaign[]) => {
    const totalSpent = campaignList.reduce((sum, c) => sum + c.spent, 0);
    const totalClicks = campaignList.reduce((sum, c) => sum + c.clicks, 0);
    const totalImpressions = campaignList.reduce((sum, c) => sum + c.impressions, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averageCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const activeCampaigns = campaignList.filter(c => c.status === 'active').length;

    const campaignsByPlatform = {
      facebook: campaignList.filter(c => c.platform === 'facebook').length,
      instagram: campaignList.filter(c => c.platform === 'instagram').length,
      google: campaignList.filter(c => c.platform === 'google').length
    };

    setDashboardData({
      totalSpent,
      totalClicks,
      totalImpressions,
      averageCTR: Number(averageCTR.toFixed(2)),
      averageCPC: Number(averageCPC.toFixed(2)),
      activeCampaigns,
      campaignsByPlatform
    });
  };

  const handleAddCampaign = () => {
    if (!newCampaign.name || !newCampaign.platform || !newCampaign.budget) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      platform: newCampaign.platform as any,
      budget: Number(newCampaign.budget),
      spent: Number(newCampaign.spent) || 0,
      clicks: Number(newCampaign.clicks) || 0,
      impressions: Number(newCampaign.impressions) || 0,
      targetAudience: newCampaign.targetAudience,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      status: 'active'
    };

    const updatedCampaigns = [...campaigns, campaign];
    setCampaigns(updatedCampaigns);
    calculateDashboardData(updatedCampaigns);
    
    setNewCampaign({
      name: '',
      platform: '',
      budget: '',
      spent: '',
      clicks: '',
      impressions: '',
      targetAudience: '',
      startDate: '',
      endDate: ''
    });
    setShowAddCampaign(false);
    toast.success('Campanha adicionada com sucesso!');
  };

  const handleAnalyzeCampaign = (campaign: Campaign) => {
    const metrics = calculateMetrics(campaign);
    const recs = generateRecommendations(campaign, metrics);
    setSelectedCampaign(campaign);
    setRecommendations(recs);
    toast.success(`${recs.length} recomendações geradas para ${campaign.name}`);
  };

  const handleSubmitFeedback = () => {
    if (!feedback.comment.trim()) {
      toast.error('Por favor, adicione um comentário');
      return;
    }

    // In a real app, this would be sent to a backend
    toast.success('Obrigado pelo seu feedback! Isso nos ajuda a melhorar o ClickWise.');
    setFeedback({ rating: 5, comment: '', category: 'general' });
    setShowFeedback(false);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('clickwise-relatorio.pdf');
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const chartData = campaigns.map(campaign => ({
    name: campaign.name.substring(0, 15) + '...',
    spent: campaign.spent,
    clicks: campaign.clicks,
    impressions: campaign.impressions / 1000, // Scale down for better visualization
    ctr: calculateMetrics(campaign).ctr
  }));

  const platformData = dashboardData ? [
    { name: 'Facebook', value: dashboardData.campaignsByPlatform.facebook, color: '#1877F2' },
    { name: 'Instagram', value: dashboardData.campaignsByPlatform.instagram, color: '#E4405F' },
    { name: 'Google', value: dashboardData.campaignsByPlatform.google, color: '#4285F4' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ClickWise</h1>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={exportToPDF}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Compartilhe seu Feedback</DialogTitle>
                    <DialogDescription>
                      Sua opinião é muito importante para melhorarmos o ClickWise
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Avaliação (1-5)</Label>
                      <Select value={feedback.rating.toString()} onValueChange={(value) => setFeedback({...feedback, rating: Number(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Ruim</SelectItem>
                          <SelectItem value="2">2 - Ruim</SelectItem>
                          <SelectItem value="3">3 - Regular</SelectItem>
                          <SelectItem value="4">4 - Bom</SelectItem>
                          <SelectItem value="5">5 - Excelente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={feedback.category} onValueChange={(value) => setFeedback({...feedback, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usability">Usabilidade</SelectItem>
                          <SelectItem value="recommendations">Recomendações</SelectItem>
                          <SelectItem value="features">Funcionalidades</SelectItem>
                          <SelectItem value="general">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="comment">Comentário</Label>
                      <Textarea
                        id="comment"
                        placeholder="Conte-nos sua experiência..."
                        value={feedback.comment}
                        onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleSubmitFeedback} className="w-full">
                      Enviar Feedback
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showAddCampaign} onOpenChange={setShowAddCampaign}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Campanha</DialogTitle>
                    <DialogDescription>
                      Insira os dados da sua campanha para receber recomendações personalizadas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome da Campanha *</Label>
                      <Input
                        id="name"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                        placeholder="Ex: Promoção de Verão"
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform">Plataforma *</Label>
                      <Select value={newCampaign.platform} onValueChange={(value) => setNewCampaign({...newCampaign, platform: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">Orçamento (R$) *</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={newCampaign.budget}
                          onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="spent">Gasto (R$)</Label>
                        <Input
                          id="spent"
                          type="number"
                          value={newCampaign.spent}
                          onChange={(e) => setNewCampaign({...newCampaign, spent: e.target.value})}
                          placeholder="3200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clicks">Cliques</Label>
                        <Input
                          id="clicks"
                          type="number"
                          value={newCampaign.clicks}
                          onChange={(e) => setNewCampaign({...newCampaign, clicks: e.target.value})}
                          placeholder="1250"
                        />
                      </div>
                      <div>
                        <Label htmlFor="impressions">Impressões</Label>
                        <Input
                          id="impressions"
                          type="number"
                          value={newCampaign.impressions}
                          onChange={(e) => setNewCampaign({...newCampaign, impressions: e.target.value})}
                          placeholder="45000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="audience">Público-alvo</Label>
                      <Input
                        id="audience"
                        value={newCampaign.targetAudience}
                        onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
                        placeholder="Ex: Mulheres 25-45, interessadas em moda"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Data Início</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newCampaign.startDate}
                          onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Data Fim</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newCampaign.endDate}
                          onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddCampaign} className="w-full">
                      Adicionar Campanha
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="dashboard-content">
        {/* Dashboard Overview */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Investido</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalSpent)}</div>
                <p className="text-xs text-gray-500 mt-1">Todas as campanhas ativas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Cliques</CardTitle>
                <MousePointer className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.totalClicks)}</div>
                <p className="text-xs text-gray-500 mt-1">CPC médio: {formatCurrency(dashboardData.averageCPC)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Impressões</CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.totalImpressions)}</div>
                <p className="text-xs text-gray-500 mt-1">CTR médio: {formatPercentage(dashboardData.averageCTR)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Campanhas Ativas</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{dashboardData.activeCampaigns}</div>
                <p className="text-xs text-gray-500 mt-1">Em execução</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid gap-6">
              {campaigns.map((campaign) => {
                const metrics = calculateMetrics(campaign);
                return (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {campaign.name}
                            <Badge 
                              variant="secondary" 
                              style={{ backgroundColor: getPlatformColor(campaign.platform) + '20', color: getPlatformColor(campaign.platform) }}
                            >
                              {campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{campaign.targetAudience}</CardDescription>
                        </div>
                        <Button
                          onClick={() => handleAnalyzeCampaign(campaign)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analisar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Orçamento</p>
                          <p className="text-lg font-semibold">{formatCurrency(campaign.budget)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gasto</p>
                          <p className="text-lg font-semibold">{formatCurrency(campaign.spent)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CTR</p>
                          <p className="text-lg font-semibold">{formatPercentage(metrics.ctr)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CPC</p>
                          <p className="text-lg font-semibold">{formatCurrency(metrics.cpc)}</p>
                        </div>
                      </div>
                      <div className="mt-4 bg-gray-100 rounded-lg h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-lg transition-all duration-300"
                          style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((campaign.spent / campaign.budget) * 100).toFixed(1)}% do orçamento utilizado
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Campanha</CardTitle>
                  <CardDescription>Comparação de gastos, cliques e impressões</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="spent" fill="#3B82F6" name="Gasto (R$)" />
                      <Bar dataKey="clicks" fill="#10B981" name="Cliques" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Plataforma</CardTitle>
                  <CardDescription>Número de campanhas por plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Taxa de Cliques (CTR) por Campanha</CardTitle>
                  <CardDescription>Evolução da performance de cliques</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="ctr" stroke="#8B5CF6" strokeWidth={2} name="CTR (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {selectedCampaign ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recomendações para: {selectedCampaign.name}
                  </h3>
                  <p className="text-gray-600">
                    Baseado na análise dos dados da sua campanha, aqui estão as principais oportunidades de otimização:
                  </p>
                </div>
                <div className="grid gap-4">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <div className="flex gap-2">
                            <Badge className={getImpactColor(rec.impact)}>
                              {rec.impact === 'high' ? 'Alto Impacto' : rec.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                            </Badge>
                            <Badge variant="outline">
                              {rec.effort === 'easy' ? 'Fácil' : rec.effort === 'medium' ? 'Médio' : 'Complexo'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            Melhoria estimada: {rec.estimatedImprovement}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Selecione uma campanha para análise
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Clique em "Analisar" em qualquer campanha para receber recomendações personalizadas de otimização.
                    </p>
                    <Button
                      onClick={() => campaigns.length > 0 && handleAnalyzeCampaign(campaigns[0])}
                      disabled={campaigns.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {campaigns.length > 0 ? 'Analisar Primeira Campanha' : 'Adicione uma campanha primeiro'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}