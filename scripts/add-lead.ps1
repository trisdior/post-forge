$body = @{
  source = "Facebook"
  category = "Painting"
  clientName = "Tami Tee"
  location = "Lynwood, IL (South Suburbs)"
  description = "Window removed - needs drywall repair, mud/tape/paint on interior wall where window was. Small ceiling crack repair. Bedroom 4 walls painted (trim/ceiling already done). Wants ASAP."
  estValue = 1300
  priority = "Hot"
  notes = "FB Group: Chicago Renovation Room (32 comments - move fast!). READY-TO-PASTE REPLY: Hi Tami! I'm Tris with Valencia Construction - licensed and insured GC in Chicago. We do exactly this kind of work: drywall patching, skim coat, painting. I can come out to Lynwood and give you a free estimate this week. Shoot me a text at (773) 682-7788 and we'll get you taken care of ASAP!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/leads/add" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
Write-Output $response.Content
