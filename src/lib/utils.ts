import { Campaign, CampaignMetrics, Recommendation } from './types';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateMetrics(campaign: Campaign): CampaignMetrics {
  const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;
  const cpm = campaign.impressions > 0 ? (campaign.spent / campaign.impressions) * 1000 : 0;
  
  return {
    ctr: Number(ctr.toFixed(2)),
    cpc: Number(cpc.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    roas: 0, // Would need revenue data
    conversionRate: 0 // Would need conversion data
  };
}

export function generateRecommendations(campaign: Campaign, metrics: CampaignMetrics): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // CTR Analysis
  if (metrics.ctr < 1.0) {
    recommendations.push({
      id: `${campaign.id}-ctr`,
      type: 'creative',
      title: 'Melhore a Taxa de Cliques (CTR)',
      description: `Sua CTR atual é ${metrics.ctr}%, que está abaixo da média. Teste novos criativos, headlines mais chamativas e calls-to-action mais persuasivos.`,
      impact: 'high',
      effort: 'medium',
      estimatedImprovement: '+25-40% em cliques'
    });
  }

  // CPC Analysis
  if (metrics.cpc > 2.0) {
    recommendations.push({
      id: `${campaign.id}-cpc`,
      type: 'bidding',
      title: 'Otimize o Custo por Clique (CPC)',
      description: `Seu CPC de R$ ${metrics.cpc} está alto. Considere ajustar a estratégia de lances, refinar o público-alvo ou testar horários diferentes.`,
      impact: 'high',
      effort: 'easy',
      estimatedImprovement: '-15-30% no CPC'
    });
  }

  // Budget Analysis
  const budgetUtilization = (campaign.spent / campaign.budget) * 100;
  if (budgetUtilization < 80) {
    recommendations.push({
      id: `${campaign.id}-budget`,
      type: 'budget',
      title: 'Aumente o Orçamento da Campanha',
      description: `Você está usando apenas ${budgetUtilization.toFixed(1)}% do orçamento. Considere aumentar o investimento para ampliar o alcance.`,
      impact: 'medium',
      effort: 'easy',
      estimatedImprovement: '+20-50% em impressões'
    });
  }

  // Audience Analysis
  if (campaign.platform === 'facebook' || campaign.platform === 'instagram') {
    recommendations.push({
      id: `${campaign.id}-audience`,
      type: 'audience',
      title: 'Teste Públicos Similares',
      description: 'Crie públicos similares baseados nos seus melhores clientes para encontrar novos prospects qualificados.',
      impact: 'medium',
      effort: 'medium',
      estimatedImprovement: '+10-25% na qualidade dos leads'
    });
  }

  // Platform-specific recommendations
  if (campaign.platform === 'google') {
    recommendations.push({
      id: `${campaign.id}-keywords`,
      type: 'audience',
      title: 'Refine as Palavras-chave',
      description: 'Adicione palavras-chave negativas e teste variações de correspondência para melhorar a relevância dos anúncios.',
      impact: 'high',
      effort: 'medium',
      estimatedImprovement: '+15-35% na qualidade do tráfego'
    });
  }

  return recommendations.slice(0, 5); // Return max 5 recommendations
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'facebook':
      return '#1877F2';
    case 'instagram':
      return '#E4405F';
    case 'google':
      return '#4285F4';
    default:
      return '#6B7280';
  }
}

export function getImpactColor(impact: string): string {
  switch (impact) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}