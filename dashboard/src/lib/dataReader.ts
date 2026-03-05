import fs from 'fs';
import path from 'path';
import { BusinessData } from './types';

export async function readBusinessData(): Promise<BusinessData> {
  const dataDir = path.join(process.cwd(), '..', 'mission-control');
  
  try {
    // Read master control file
    const masterPath = path.join(dataDir, 'MASTER-CONTROL.md');
    const trovvaPath = path.join(dataDir, 'TROVVA-AI-CONTROL.md');
    
    const masterContent = fs.existsSync(masterPath) 
      ? fs.readFileSync(masterPath, 'utf-8') 
      : '';
    const trovvaContent = fs.existsSync(trovvaPath) 
      ? fs.readFileSync(trovvaPath, 'utf-8') 
      : '';

    // Parse data from files
    const data: BusinessData = {
      valencia: {
        status: 'In Progress',
        clients: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: 'Get 1st consultation (Feb 28)',
      },
      trovva: {
        status: 'Pre-Launch',
        followers: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: 'Launch Monday, March 1',
        launchDate: 'March 1, 2026',
      },
      delvrai: {
        status: 'Planning',
        clients: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: '10 clients by April',
      },
      totalFollowers: 0,
      totalRevenue: 0,
      targetMonthly: 25000,
    };

    // Parse master control for Valencia data
    if (masterContent) {
      const revenueMatch = masterContent.match(/Monthly Revenue:\s*\$(\d+)/);
      if (revenueMatch) {
        data.valencia.revenue = parseInt(revenueMatch[1]) || 0;
      }
      
      const clientsMatch = masterContent.match(/Contacts:\s*(\d+)/);
      if (clientsMatch) {
        data.valencia.clients = parseInt(clientsMatch[1]) || 0;
      }
      
      data.valencia.progressPercent = Math.min((data.valencia.clients / 25) * 100, 100);
    }

    // Parse Trovva control
    if (trovvaContent) {
      const followerMatch = trovvaContent.match(/followers\s*(\d+)/i);
      if (followerMatch) {
        data.trovva.followers = parseInt(followerMatch[1]) || 0;
      }
      
      data.trovva.progressPercent = Math.min((data.trovva.followers / 5000) * 100, 100);
    }

    data.totalRevenue = data.valencia.revenue + data.trovva.revenue + data.delvrai.revenue;
    data.totalFollowers = data.trovva.followers;

    return data;
  } catch (error) {
    console.error('Error reading business data:', error);
    
    // Return default data if files don't exist
    return {
      valencia: {
        status: 'In Progress',
        clients: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: 'Get 1st consultation (Feb 28)',
      },
      trovva: {
        status: 'Pre-Launch',
        followers: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: 'Launch Monday, March 1',
        launchDate: 'March 1, 2026',
      },
      delvrai: {
        status: 'Planning',
        clients: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: '10 clients by April',
      },
      totalFollowers: 0,
      totalRevenue: 0,
      targetMonthly: 25000,
    };
  }
}
