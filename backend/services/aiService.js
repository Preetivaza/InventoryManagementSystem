import OpenAI from 'openai';

// Lazy OpenAI client - reads API key only when needed (after dotenv loads)
let _openai = undefined;
const getOpenAI = () => {
    if (_openai === undefined) {
        _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
        if (_openai) {
            console.log('✅ OpenAI client initialized');
        } else {
            console.log('⚠️ No OPENAI_API_KEY found - using rule-based AI fallback');
        }
    }
    return _openai;
};

const AI_MODEL = 'gpt-3.5-turbo'; // Faster & cheaper than gpt-4, works great for inventory

/**
 * Generate demand forecast using AI
 */
export const generateAIForecast = async (historicalSales) => {
    try {
        const openai = getOpenAI();
        if (!openai) return generateRuleBasedForecast(historicalSales);

        const prompt = `Given the following historical sales data, predict the next 7 days of sales:
${JSON.stringify(historicalSales)}

Provide predictions in JSON format with ONLY this array (no extra text):
[
  { "day": "Day 1", "predictedSales": number },
  { "day": "Day 2", "predictedSales": number },
  { "day": "Day 3", "predictedSales": number },
  { "day": "Day 4", "predictedSales": number },
  { "day": "Day 5", "predictedSales": number },
  { "day": "Day 6", "predictedSales": number },
  { "day": "Day 7", "predictedSales": number }
]`;

        const response = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert data analyst specializing in sales forecasting. Return only valid JSON, no explanation.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const content = response.choices[0].message.content.trim();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const prediction = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return prediction;
    } catch (error) {
        console.error('AI Forecast Error:', error.message);
        return generateRuleBasedForecast(historicalSales);
    }
};

/**
 * Generate smart reorder recommendations
 */
export const generateReorderRecommendations = async (products, salesHistory) => {
    try {
        const openai = getOpenAI();
        if (!openai) return generateRuleBasedReorder(products, salesHistory);

        const prompt = `Analyze this inventory data and sales history to recommend optimal reorder quantities:

Products: ${JSON.stringify(products.slice(0, 10))}
Recent Sales: ${JSON.stringify(salesHistory.slice(0, 20))}

Return ONLY a JSON array (no explanation):
[
  {
    "productId": "id",
    "productName": "name",
    "currentStock": number,
    "recommendedOrder": number,
    "reason": "explanation",
    "urgency": "high|medium|low"
  }
]`;

        const response = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an inventory optimization expert. Return only valid JSON, no explanation.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 1000
        });

        const content = response.choices[0].message.content.trim();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const recommendations = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return recommendations;
    } catch (error) {
        console.error('Reorder Recommendation Error:', error.message);
        return generateRuleBasedReorder(products, salesHistory);
    }
};

/**
 * AI Inventory Assistant - Answer questions about inventory
 */
export const askInventoryAssistant = async (question, context) => {
    try {
        const openai = getOpenAI();
        if (!openai) {
            // Smart rule-based fallback instead of just an error
            return generateRuleBasedAnswer(question, context);
        }

        const response = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are an intelligent inventory management assistant for InventoTrack.
You have access to this data:

Products: ${JSON.stringify(context.products)}
Recent Sales: ${JSON.stringify(context.sales)}
Low Stock Items: ${JSON.stringify(context.lowStock)}

Answer questions about inventory concisely and helpfully. Format numbers as currency where appropriate.`
                },
                { role: 'user', content: question }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        return {
            answer: response.choices[0].message.content,
            confidence: 0.9,
            powered_by: 'gpt-3.5-turbo'
        };
    } catch (error) {
        console.error('AI Assistant Error:', error.message);
        return generateRuleBasedAnswer(question, context);
    }
};

/**
 * Detect anomalies in sales patterns
 */
export const detectAnomalies = async (salesData) => {
    try {
        const openai = getOpenAI();
        if (!openai) return detectRuleBasedAnomalies(salesData);

        const prompt = `Analyze this sales data to detect any anomalies or unusual patterns:
${JSON.stringify(salesData.slice(0, 50))}

Return ONLY valid JSON (no explanation):
{
  "anomalies": [
    {
      "type": "spike|drop|pattern",
      "product": "name",
      "description": "what is unusual",
      "impact": "high|medium|low"
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a data scientist specializing in anomaly detection. Return only valid JSON.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 800
        });

        const content = response.choices[0].message.content.trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (error) {
        console.error('Anomaly Detection Error:', error.message);
        return detectRuleBasedAnomalies(salesData);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Fallback rule-based functions (when AI key is not available)
// ─────────────────────────────────────────────────────────────────────────────

function generateRuleBasedForecast(historicalSales) {
    const amounts = historicalSales.map(s => s.totalAmount || 0);
    const avg = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 100;
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
        forecast.push({
            day: `Day ${i}`,
            predictedSales: Math.round(avg * (0.9 + Math.random() * 0.2))
        });
    }
    return forecast;
}

function generateRuleBasedReorder(products, salesHistory) {
    const recommendations = [];
    products.forEach(product => {
        const productSales = salesHistory.filter(sale =>
            sale.products && sale.products.some(p =>
                p.product && (p.product._id?.toString() === product._id?.toString() || p.product?.toString() === product._id?.toString())
            )
        );
        const avgSalesPerDay = productSales.length / 30;
        const daysOfStock = product.quantity / (avgSalesPerDay || 1);

        if (daysOfStock < 14 || product.quantity <= product.minStockLevel) {
            recommendations.push({
                productId: product._id,
                productName: product.name,
                currentStock: product.quantity,
                recommendedOrder: Math.max(Math.ceil(avgSalesPerDay * 30), product.minStockLevel * 2),
                reason: product.quantity <= product.minStockLevel
                    ? `⚠️ Below minimum stock level (${product.minStockLevel})`
                    : `Only ~${Math.round(daysOfStock)} days of stock remaining`,
                urgency: product.quantity <= product.minStockLevel ? 'high' : daysOfStock < 7 ? 'high' : 'medium'
            });
        }
    });
    return recommendations;
}

function generateRuleBasedAnswer(question, context) {
    const q = question.toLowerCase();
    const { products = [], sales = [], lowStock = [] } = context;

    let answer = '';

    if (q.includes('price') || q.includes('cost')) {
        const matched = products.filter(p => q.includes(p.name.toLowerCase()));
        if (matched.length > 0) {
            answer = matched.map(p => `**${p.name}**: $${p.price.toFixed(2)}`).join('\n');
        } else {
            const sorted = [...products].sort((a, b) => b.price - a.price);
            answer = `Here are product prices:\n${sorted.slice(0, 5).map(p => `• ${p.name}: $${p.price.toFixed(2)}`).join('\n')}`;
        }
    } else if (q.includes('low stock') || q.includes('reorder') || q.includes('running out')) {
        if (lowStock.length === 0) {
            answer = '✅ All products are well-stocked! No items below minimum stock level.';
        } else {
            answer = `⚠️ **${lowStock.length} items need restocking:**\n${lowStock.map(p => `• ${p.name}: ${p.quantity} units (min: ${p.minStockLevel})`).join('\n')}`;
        }
    } else if (q.includes('total') && (q.includes('product') || q.includes('inventory'))) {
        const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        answer = `📦 **Inventory Summary:**\n• Total products: ${products.length}\n• Total inventory value: $${totalValue.toFixed(2)}\n• Low stock items: ${lowStock.length}`;
    } else if (q.includes('sale') || q.includes('revenue')) {
        const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        answer = `💰 **Sales Summary (recent):**\n• Total sales: ${sales.length}\n• Total revenue: $${totalRevenue.toFixed(2)}\n• Average sale: $${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}`;
    } else if (q.includes('best') || q.includes('top') || q.includes('most')) {
        const sorted = [...products].sort((a, b) => b.quantity - a.quantity);
        answer = `🏆 **Top products by stock:**\n${sorted.slice(0, 5).map((p, i) => `${i + 1}. ${p.name}: ${p.quantity} units`).join('\n')}`;
    } else {
        // Generic inventory overview
        const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        answer = `📊 **Inventory Overview:**\n• ${products.length} products tracked\n• Total value: $${totalValue.toFixed(2)}\n• ${lowStock.length} items low on stock\n• ${sales.length} recent sales\n\n💡 Try asking about: prices, low stock items, sales revenue, or top products!`;
    }

    return { answer, confidence: 0.7, powered_by: 'rule-based' };
}

function detectRuleBasedAnomalies(salesData) {
    const anomalies = [];
    if (salesData.length === 0) return { anomalies };

    const amounts = salesData.map(s => s.totalAmount || 0);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + (n - avg) ** 2, 0) / amounts.length);

    salesData.forEach(sale => {
        if (sale.totalAmount > avg + 2 * stdDev) {
            anomalies.push({
                type: 'spike',
                product: sale.products?.[0]?.product?.name || 'Multiple',
                description: `Unusually high sale: $${sale.totalAmount?.toFixed(2)} (avg: $${avg.toFixed(2)})`,
                impact: 'medium'
            });
        } else if (sale.totalAmount < avg - 2 * stdDev && stdDev > 0) {
            anomalies.push({
                type: 'drop',
                product: sale.products?.[0]?.product?.name || 'Multiple',
                description: `Unusually low sale: $${sale.totalAmount?.toFixed(2)}`,
                impact: 'low'
            });
        }
    });

    return { anomalies };
}

export default {
    generateAIForecast,
    generateReorderRecommendations,
    askInventoryAssistant,
    detectAnomalies
};
