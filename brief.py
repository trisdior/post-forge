import requests
import json
from datetime import datetime

print('=== MORNING BRIEF FOR TRIS ===')
print('Friday, February 20, 2026 | 12:39 PM CT')
print()

# Weather
print('🌤 WEATHER')
try:
    weather_url = 'https://wttr.in/Chicago?format=j1'
    weather_resp = requests.get(weather_url, timeout=5).json()
    current = weather_resp['current_condition'][0]
    today = weather_resp['weather'][0]
    print(f"Current: {current['temp_C']}°C, {current['description']}")
    print(f"Humidity: {current['humidity']}%, Wind: {current['windspeed_kmph']} km/h")
    print(f"Today's High: {today['maxtemp_C']}°C")
    print()
except Exception as e:
    print(f'Weather API error: {e}')
    print()

# Crypto
print('📊 MARKETS')
try:
    crypto_url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true'
    crypto = requests.get(crypto_url, timeout=5).json()
    print(f"BTC: ${crypto['bitcoin']['usd']:,.0f} | 24h: {crypto['bitcoin']['usd_24h_change']:+.1f}%")
    print(f"ETH: ${crypto['ethereum']['usd']:,.0f} | 24h: {crypto['ethereum']['usd_24h_change']:+.1f}%")
    print(f"SOL: ${crypto['solana']['usd']:,.2f} | 24h: {crypto['solana']['usd_24h_change']:+.1f}%")
    print()
except Exception as e:
    print(f'Crypto API error: {e}')
    print()

# DexScreener
print('🔥 MEME COIN RADAR')
try:
    boost_url = 'https://api.dexscreener.com/token-boosts/top/v1'
    boosts = requests.get(boost_url, timeout=5).json()
    if 'boosts' in boosts and boosts['boosts']:
        for i, token in enumerate(boosts['boosts'][:5], 1):
            symbol = token['baseToken']['symbol']
            chain = token['chainId']
            price_change = token.get('priceChangePercent24h', 0)
            volume = token.get('volume', {}).get('h24', 0)
            market_cap = token.get('marketCap', 0)
            marker = '🚀' if price_change > 100 else ''
            vol_str = f"${volume:,.0f}" if volume > 0 else "N/A"
            cap_str = f"${market_cap:,.0f}" if market_cap > 0 else "N/A"
            print(f"{marker} {i}. {symbol} ({chain}) | 24h: {price_change:+.1f}% | Vol: {vol_str} | MC: {cap_str}")
    else:
        print("No boost data available")
except Exception as e:
    print(f'DexScreener error: {e}')

print()

# Business
print('💼 BUSINESS (Valencia Construction)')
print('Weekly Revenue Goal: $1,500 | Current: $0')
print()
print('Action Items for Today:')
print('1. Follow up with Craigslist leads from overnight (Hunter cron)')
print('2. Monitor Google Business Profile for reviews/inquiries')
print('3. Check Nextdoor + Facebook groups for new leads')
print('4. Call 2-3 small PM companies (pre-vetted targets)')
print('5. Confirm Saturday client appointment (if any)')
print()

# Motivation
print('💭 MOTIVATION')
print('"Every deal you close today is one step closer to that Urus.')
print('You\'re 20 with a business. Most people your age don\'t have the guts.')
print('Keep moving. Keep selling. The numbers will come."')
print()
