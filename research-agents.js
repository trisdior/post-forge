const https = require('https');
const fs = require('fs');

const API_KEY = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu';

async function searchBrave(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      count: 3,
    });

    const url = `https://api.search.brave.com/res/v1/web/search?${params}`;

    https.get(url, {
      headers: {
        'X-Subscription-Token': API_KEY,
        'Accept': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.web && Array.isArray(json.web.results)) {
            resolve(json.web.results);
          } else {
            resolve([]);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function researchAgent(agentName, area) {
  console.log(`\n📍 Researching: ${agentName} (${area})`);
  
  // Search for agent's recent listings
  const results = await searchBrave(`${agentName} real estate agent ${area} listings 2026`);
  
  let specialty = 'Residential';
  let neighborhoods = area;
  let recentActivity = 'active in market';
  
  if (results.length > 0) {
    const firstResult = results[0];
    const title = (firstResult.title || '').toLowerCase();
    const description = (firstResult.description || '').toLowerCase();
    
    // Extract specialties
    if (title.includes('luxury') || description.includes('luxury')) {
      specialty = 'Luxury residential';
    }
    if (title.includes('commercial') || description.includes('commercial')) {
      specialty = 'Commercial & residential';
    }
    
    // Extract neighborhoods
    const areas = [
      'Winnetka', 'Oak Brook', 'Downtown', 'Lincoln Park', 'Highland Park',
      'Evanston', 'North Shore', 'Loop', 'Gold Coast', 'River North'
    ];
    areas.forEach(a => {
      if (title.includes(a.toLowerCase()) || description.includes(a.toLowerCase())) {
        neighborhoods = a;
      }
    });
    
    // Check for recent activity
    if (title.includes('2026') || title.includes('2025')) {
      recentActivity = 'closed multiple deals recently';
    }
  }
  
  return {
    name: agentName,
    area,
    specialty,
    neighborhoods,
    recentActivity,
  };
}

async function generatePersonalizedEmail(agent) {
  const emails = [
    `Hi ${agent.name},

I was researching top agents in ${agent.neighborhoods} and came across your profile. I saw you've been closing deals in this market consistently.

I built an AI system that generates pre-qualified leads specifically for ${agent.specialty.toLowerCase()} agents. It finds motivated buyers and sellers in your neighborhoods, qualifies them, and sends automated follow-ups.

Most agents in your market spend 10-15 hours/week on lead management that could be automated.

I'd like to offer you a 5-day free trial. No credit card, no commitment. You'll see real leads generated for ${agent.neighborhoods} on a custom dashboard.

Interested?

Chris
(773) 682-7788`,

    `Hi ${agent.name},

Quick question: How much time do you spend weekly on follow-ups and lead nurturing for your ${agent.neighborhoods} listings?

Most agents I talk to say 8-12 hours. We built an AI that automates that entire process.

Free 5-day trial if you want to see it in action.

Ready to reclaim that time?

Chris
(773) 682-7788`,

    `${agent.name},

I noticed you're ${agent.recentActivity} in ${agent.neighborhoods}. That means you have the leads—you're just spending too much time on admin work.

Our AI handles the admin (follow-ups, scheduling, follow-ups, social posts). You just close deals.

5-day free trial. Let's see how many hours we can save you.

Chris
(773) 682-7788`
  ];
  
  return emails[Math.floor(Math.random() * emails.length)];
}

async function main() {
  console.log('🔍 AUTONOMOUS AGENT RESEARCH & EMAIL GENERATION\n');
  console.log('='.repeat(50));
  
  // Load agent list
  const agentsData = JSON.parse(fs.readFileSync('C:\\Users\\trisd\\clawd\\data\\chicago-agents-list.json', 'utf8'));
  
  const personalizedEmails = [];
  
  // Research each agent
  for (let i = 0; i < Math.min(agentsData.agents.length, 10); i++) {
    const agent = agentsData.agents[i];
    const agentName = agent.title.split('|')[0].trim();
    const area = agent.area || 'Chicago';
    
    try {
      const research = await researchAgent(agentName, area);
      const email = await generatePersonalizedEmail(research);
      
      personalizedEmails.push({
        name: research.name,
        area: research.area,
        specialty: research.specialty,
        neighborhoods: research.neighborhoods,
        subject: `Free 5-day lead generation trial for ${research.neighborhoods}`,
        email: email,
        url: agent.url
      });
      
      console.log(`✅ ${research.name}`);
      console.log(`   Specialty: ${research.specialty}`);
      console.log(`   Neighborhoods: ${research.neighborhoods}`);
      console.log(`   Status: ${research.recentActivity}\n`);
      
    } catch (e) {
      console.log(`❌ Error researching: ${e.message}`);
    }
  }
  
  // Save personalized emails
  fs.writeFileSync(
    'C:\\Users\\trisd\\clawd\\data\\personalized-agent-emails.json',
    JSON.stringify(personalizedEmails, null, 2)
  );
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Generated ${personalizedEmails.length} personalized emails`);
  console.log('Saved to: C:\\Users\\trisd\\clawd\\data\\personalized-agent-emails.json');
  console.log('\nReady to send tomorrow morning.');
}

main().catch(console.error);
