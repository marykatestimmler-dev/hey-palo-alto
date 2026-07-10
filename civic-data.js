/* civic-data.js — generated/curated from ingest/ingest.mjs output.
 *
 * REAL Palo Alto agenda data (City Council + commissions), pulled from the city's
 * PrimeGov portal. This committed file is a curated recent slice so the app shows
 * every body with real items out of the box. Running `cd ingest && npm install &&
 * node ingest.mjs` (or deploying — the GitHub Action runs it nightly) regenerates
 * this with the complete past-6 / next-6-month dataset for all bodies.
 */
window.CIVIC_DATA = {
  "generatedAt": "2026-06-09T00:00:00.000Z",
  "source": "City of Palo Alto PrimeGov portal",
  "portalBase": "https://cityofpaloalto.primegov.com",
  "window": { "from": "2026-04-26", "to": "2026-12-10" },
  "bodies": [
    { "name": "City Council", "slug": "city-council", "email": "city.council@PaloAlto.gov", "kind": "Elected body", "desc": "", "schedule": "Most Mondays, 5:30 p.m." },
    { "name": "Architectural Review Board", "slug": "architectural-review-board", "email": "arb@paloalto.gov", "kind": "Citizen board", "schedule": "1st & 3rd Thursdays, 8:30 a.m.",
      "desc": "Charged with design review of all new construction, and changes and additions to commercial, industrial and multiple-family projects; reviews and makes recommendations to the Planning Director on building and site design.",
      "source": "https://www.paloalto.gov/Departments/Planning-Development-Services/Architectural-Review-Board-ARB" },
    { "name": "Climate Action & Sustainability Committee", "slug": "climate-action-and-sustainability-committee", "email": "city.clerk@PaloAlto.gov", "kind": "Council committee",
      "desc": "Formed by the City Council in January 2025 to accelerate implementation of the Climate Action workplan items of the three-year Sustainability and Climate Action Plan (S/CAP).",
      "source": "https://www.paloalto.gov/Departments/City-Clerk/City-Council-Committees/Climate-Action-Sustainability-Ad-Hoc-Committee" },
    { "name": "Council Appointed Officer Committee", "slug": "council-appointed-officer-committee", "email": "city.clerk@PaloAlto.gov", "kind": "Council committee",
      "desc": "Discusses items pertaining to the City's Council-Appointed Officers — the City Attorney, City Auditor, City Clerk, and City Manager — including their direction, recruitment, and evaluation.",
      "source": "https://www.paloalto.gov/Departments/City-Clerk/City-Council-Committees/Council-Appointed-Officers-Committee" },
    { "name": "Economic Development Committee", "slug": "economic-development-committee", "email": "city.clerk@PaloAlto.gov", "kind": "Council committee", "desc": "" },
    { "name": "Finance Committee", "slug": "finance-committee", "email": "city.clerk@PaloAlto.gov", "kind": "Council committee",
      "desc": "Considers and makes recommendations on matters referred to it by the Council relating to finance, budget, audits, capital planning and debt.",
      "source": "https://www.paloalto.gov/Departments/City-Clerk/City-Council-Committees/Finance-Committee" },
    { "name": "Historic Resources Board", "slug": "historic-resources-board", "email": "hrb@paloalto.gov", "kind": "Citizen board", "schedule": "2nd Thursdays, 8:30 a.m.",
      "desc": "Reviews proposed exterior changes to commercial and multi-family buildings on the Historic Building Inventory and to significant single-family residences on it, and recommends additions and reclassifications on the Inventory to the City Council.",
      "source": "https://www.paloalto.gov/Departments/Planning-Development-Services/Historic-Resources-Board-HRB" },
    { "name": "Human Relations Commission", "slug": "human-relations-commission", "email": "hrc@paloalto.gov", "kind": "Citizen commission", "schedule": "2nd Thursdays, 6 p.m.",
      "desc": "Works to promote the just and fair treatment of all people in Palo Alto, particularly the most vulnerable; may act on any human-relations matter where a person or group does not benefit fully from community opportunities or is unfairly treated.",
      "source": "https://www.paloalto.gov/Departments/Community-Services/Other-Services/Commissions/Human-Relations-Commission" },
    { "name": "Parks & Recreation Commission", "slug": "parks-and-recreation-commission", "email": "ParkRec.commission@cityofpaloalto.org", "kind": "Citizen commission", "schedule": "4th Tuesdays, 7 p.m.",
      "desc": "Advises the City Council on the activities of the Open Space & Parks, Golf, and Recreation divisions of the Community Services Department, excluding daily administrative operations.",
      "source": "https://www.paloalto.gov/Departments/Community-Services/Other-Services/Commissions/Parks-and-Recreation-Commission" },
    { "name": "Planning & Transportation Commission", "slug": "planning-and-transportation-commission", "email": "Planning.Commission@paloalto.gov", "kind": "Citizen commission", "schedule": "2nd & last Wednesdays, 6 p.m.",
      "desc": "Prepares the long-range Comprehensive Plan; recommends additions or changes to the City's zoning regulations; reviews tentative subdivision maps and site-and-design review in designated corridors; and advises on land use planning and transportation systems.",
      "source": "https://www.paloalto.gov/Departments/Planning-Development-Services/Planning-and-Transportation-Commission-PTC" },
    { "name": "Policy & Services Committee", "slug": "policy-and-services-committee", "email": "city.clerk@PaloAlto.gov", "kind": "Council committee",
      "desc": "Considers and makes recommendations on matters referred to it by the Council relating to intergovernmental relations, personnel policies, planning and zoning, traffic and parking, public works, and community and human services.",
      "source": "https://www.paloalto.gov/Departments/City-Clerk/City-Council-Committees/Policy-and-Services-Committee" },
    { "name": "Public Art Commission", "slug": "public-art-commission", "email": "pac@paloalto.gov", "kind": "Citizen commission", "schedule": "3rd Thursdays, 7 p.m.",
      "desc": "Advises the city on the quality, quantity, scope, and style of art in public places — including the selection, placement, and care of public art, and review of the capital improvement program for inclusion of artworks.",
      "source": "https://www.paloalto.gov/Departments/Community-Services/Arts-Sciences/Public-Art-Program/Public-Art-Commission" },
    { "name": "Rail Committee", "slug": "rail-committee", "email": "city.clerk@PaloAlto.gov", "kind": "Council committee",
      "desc": "Discusses rail items such as grade separation and the work performed by the Expanded Citizen Advisory Panel (XCAP).",
      "source": "https://www.paloalto.gov/Departments/City-Clerk/City-Council-Committees/Rail-Ad-Hoc-Committee" },
    { "name": "Utilities Advisory Commission", "slug": "utilities-advisory-commission", "email": "UAC@paloalto.gov", "kind": "Citizen commission", "schedule": "1st Wednesdays, 6 p.m.",
      "desc": "An advisory commission of Council-appointed residents that advises the Council and staff on utilities matters, including the acquisition and development of electric, gas and water resources and related joint-action projects.",
      "source": "https://www.paloalto.gov/Departments/Utilities/Utilities-Advisory-Commission" }
  ],
  "meetings": [
    { "id": 2835, "body": "City Council", "bodySlug": "city-council", "bodyEmail": "city.council@PaloAlto.gov", "date": "2026-05-04", "startTime": "17:30", "videoId": "vM0GY2Rdnow", "tpl": 18709, "items": [
      { "num": "4", "title": "FY 2027 Proposed Operating and Capital Budgets — City Manager transmittal and Council discussion.", "topics": ["Budget & Taxes"], "schedTime": "7:45 PM", "elapsedSec": 8100 },
      { "num": "6", "title": "Resolution supporting the City's application for Transportation Development Act Article 3 funds ($326,590) for the South Palo Alto Bikeways Demonstration Project.", "topics": ["Transportation", "Budget & Taxes"], "schedTime": "8:45 PM", "elapsedSec": 11700 },
      { "num": "13", "title": "Second reading: Ordinance establishing an Entertainment Zone on a portion of California Avenue.", "topics": ["Downtown & Business"], "schedTime": "8:45 PM", "elapsedSec": 11700 },
      { "num": "14", "title": "Update and direction on implementation of Senate Bill 79 (SB 79) and the Downtown Housing Plan.", "topics": ["Housing", "Downtown & Business"], "schedTime": "9:05 PM", "elapsedSec": 12900 },
      { "num": "C", "title": "Informational update on Flock Automated License Plate Recognition technology.", "topics": ["Crime, Policing, and Public Safety"], "schedTime": "8:45 PM", "elapsedSec": 11700 }
    ]},
    { "id": 2836, "body": "City Council", "bodySlug": "city-council", "bodyEmail": "city.council@PaloAlto.gov", "date": "2026-05-11", "startTime": "16:30", "videoId": "EgZH_TqUdPk", "tpl": 18715, "items": [
      { "num": "4", "title": "FY 2027 Proposed Operating and Capital Budget — Finance Committee update and Council budget discussion.", "topics": ["Budget & Taxes"], "schedTime": "5:55 PM", "elapsedSec": 5100 },
      { "num": "7", "title": "3781 El Camino Real: seven-story, 183-unit multi-family housing development (Builder's Remedy).", "topics": ["Housing"], "schedTime": "7:55 PM", "elapsedSec": 12300 },
      { "num": "8", "title": "Expedited evaluation of the potential temporary closure of the Churchill Avenue rail crossing.", "topics": ["Transportation"], "schedTime": "8:55 PM", "elapsedSec": 15900 }
    ]},
    { "id": 2837, "body": "City Council", "bodySlug": "city-council", "bodyEmail": "city.council@PaloAlto.gov", "date": "2026-05-18", "startTime": "17:30", "videoId": "Ty_2_Cn3LOc", "tpl": 18721, "items": [
      { "num": "5", "title": "Resolution for Senate Bill 1 (Road Repair & Accountability Act) FY 2027 street maintenance project list.", "topics": ["Transportation"], "schedTime": "6:20 PM", "elapsedSec": 3000 },
      { "num": "13", "title": "Cubberley Project: adopt the Conceptual Master Plan and CEQA findings; receive community polling results; direction on a possible sales-tax ballot measure.", "topics": ["Parks & Open Space", "Budget & Taxes"], "schedTime": "6:50 PM", "elapsedSec": 4800 },
      { "num": "14", "title": "Builder's Remedy project at 156 California Avenue and consideration of adding Lot B to the Housing Element sites inventory.", "topics": ["Housing", "Downtown & Business"], "schedTime": "7:50 PM", "elapsedSec": 8400 },
      { "num": "15", "title": "First reading: Ordinance implementing Retail Vitality policies, including zoning map changes for CN(GF) parcels.", "topics": ["Downtown & Business"], "schedTime": "8:50 PM", "elapsedSec": 12000 }
    ]},
    { "id": 2838, "body": "City Council", "bodySlug": "city-council", "bodyEmail": "city.council@PaloAlto.gov", "date": "2026-06-01", "startTime": "17:30", "videoId": "Cczy-CGO8IE", "tpl": 18727, "items": [
      { "num": "2", "title": "Study Session on Flock Automated License Plate Recognition technology.", "topics": ["Crime, Policing, and Public Safety"], "schedTime": "6:20 PM", "elapsedSec": 3000 },
      { "num": "4", "title": "Recommendation to indefinitely defer both expansion of the Rental Registry Program and further consideration of a possible Rent Stabilization ordinance.", "topics": ["Housing"], "schedTime": "7:20 PM", "elapsedSec": 6600 },
      { "num": "16", "title": "Outdoor Activation Standards, pre-approved parklet plans and public-space design for the car-free portion of California Avenue; first reading of parklet sign-code changes.", "topics": ["Downtown & Business", "Transportation"], "schedTime": "8:20 PM", "elapsedSec": 10200 },
      { "num": "17", "title": "Update and direction on implementing SB 79 and the Downtown Housing Plan; two temporary ordinances and a Transit Oriented Development combining district.", "topics": ["Housing"], "schedTime": "9:20 PM", "elapsedSec": 13800 }
    ]},
    { "id": 2844, "body": "City Council", "bodySlug": "city-council", "bodyEmail": "city.council@PaloAlto.gov", "date": "2026-06-15", "startTime": "17:30", "videoId": null, "tpl": 18739, "items": [
      { "num": "2", "title": "Public Hearing & Proposition 218 Hearing: adopt FY 2027 water, wastewater, refuse, electric, gas and stormwater utility rate changes.", "topics": ["Climate & Utilities", "Budget & Taxes"], "schedTime": "6:20 PM", "elapsedSec": 3000 },
      { "num": "3", "title": "Public Hearing: adopt the FY 2027 Operating and Capital Budgets, Table of Organization, and Municipal Fee Schedule.", "topics": ["Budget & Taxes"], "schedTime": "7:05 PM", "elapsedSec": 5700 },
      { "num": "6", "title": "Approve conceptual design for the Alma Street–Charleston Road railroad crossing near-term safety improvement project.", "topics": ["Transportation", "Crime, Policing, and Public Safety"], "schedTime": "7:50 PM", "elapsedSec": null },
      { "num": "7", "title": "Resolution authorizing the City's Prohousing Designation Program application to the state.", "topics": ["Housing"], "schedTime": "7:50 PM", "elapsedSec": null },
      { "num": "13", "title": "Contract amendment with OIR Group to continue Independent Police Auditing services.", "topics": ["Crime, Policing, and Public Safety"], "schedTime": "7:50 PM", "elapsedSec": null },
      { "num": "17", "title": "Add 855 Hamilton Avenue to the City's Historic Resources Inventory as a Category 2 resource.", "topics": ["Historic Preservation"], "schedTime": "7:50 PM", "elapsedSec": null },
      { "num": "23", "title": "Second reading of temporary ordinances implementing SB 79 and interim urgency ordinances on TOD-eligible sites.", "topics": ["Housing"], "schedTime": "7:50 PM", "elapsedSec": null },
      { "num": "24", "title": "Adopt the 2026 Bicycle and Pedestrian Transportation Plan.", "topics": ["Transportation", "Crime, Policing, and Public Safety"], "schedTime": "8:20 PM", "elapsedSec": null }
    ]},
    { "id": 2926, "body": "Planning & Transportation Commission", "bodySlug": "planning-and-transportation-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-04-29", "startTime": "18:00", "videoId": "MEchzR642KY", "tpl": 19316, "items": [
      { "num": "2", "title": "4103 Old Trace Road: tentative map to subdivide a vacant 1.02-acre lot into nine residential lots plus seven junior ADUs.", "topics": ["Housing"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2927, "body": "Planning & Transportation Commission", "bodySlug": "planning-and-transportation-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-13", "startTime": "18:00", "videoId": "VOPSPaAMMYY", "tpl": 19323, "items": [
      { "num": "2", "title": "Recommendation on an ordinance amending the Municipal Code regarding Accessory and Junior Accessory Dwelling Units to address state law changes.", "topics": ["Housing"], "schedTime": null, "elapsedSec": null },
      { "num": "3", "title": "Recommendation on an ordinance amending Section 18.40.140 (Stream Corridor Protection).", "topics": ["Parks & Open Space", "Climate & Utilities"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 3072, "body": "Planning & Transportation Commission", "bodySlug": "planning-and-transportation-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-27", "startTime": "18:00", "videoId": "vW1Xm_aHqPs", "tpl": 20305, "items": [
      { "num": "2", "title": "Review and recommendation on the proposed 2027–2031 Capital Improvement Plan and Comprehensive Plan compliance.", "topics": ["Budget & Taxes"], "schedTime": null, "elapsedSec": null },
      { "num": "3", "title": "Study session reviewing the City's Prohousing Designation Program application materials.", "topics": ["Housing"], "schedTime": null, "elapsedSec": null },
      { "num": "4", "title": "Parking programs update and Downtown parking modernization initiatives.", "topics": ["Transportation", "Downtown & Business"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2948, "body": "Architectural Review Board", "bodySlug": "architectural-review-board", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-07", "startTime": "08:30", "videoId": "aKqsmNdoNo0", "tpl": 19471, "items": [
      { "num": "2", "title": "450 Lytton Avenue: six-story, 72-unit, 100% affordable housing project replacing a City-owned surface parking lot.", "topics": ["Housing"], "schedTime": null, "elapsedSec": null },
      { "num": "3", "title": "800–808/814 San Antonio Road: rezone and redevelop with an eight-story, 174-unit residential building (35 below-market-rate units).", "topics": ["Housing"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2949, "body": "Architectural Review Board", "bodySlug": "architectural-review-board", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-21", "startTime": "08:30", "videoId": "6krA9n3EtC8", "tpl": 19478, "items": [
      { "num": "2", "title": "788–790/796 San Antonio Road: rezone and redevelop with an eight-story mixed-use building (167 rental units, 28 BMR, ground-floor retail).", "topics": ["Housing", "Downtown & Business"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2883, "body": "Utilities Advisory Commission", "bodySlug": "utilities-advisory-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-06", "startTime": "18:00", "videoId": "4feIANRH_Ns", "tpl": 19031, "items": [
      { "num": "3", "title": "Recommendation to Council to adopt the proposed Operating and Capital Budgets for the Utilities Department for FY 2027.", "topics": ["Climate & Utilities", "Budget & Taxes"], "schedTime": "6:55 PM", "elapsedSec": null },
      { "num": "4", "title": "Recommendation to adopt the 2025 Urban Water Management Plan, the Water Shortage Contingency Plan, and amendments to the City's Water Use Ordinance.", "topics": ["Climate & Utilities"], "schedTime": "7:40 PM", "elapsedSec": null }
    ]},
    { "id": 2988, "body": "Parks & Recreation Commission", "bodySlug": "parks-and-recreation-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-04-28", "startTime": "19:00", "videoId": "7Hv77R1aU20", "tpl": 19745, "items": [
      { "num": "4", "title": "Informational update on the Foothills Nature Preserve Improvements Project.", "topics": ["Parks & Open Space", "Budget & Taxes"], "schedTime": null, "elapsedSec": null },
      { "num": "6", "title": "Review and confirm the revised Parks & Recreation Commission FY 2027 Work Plan.", "topics": ["Parks & Open Space"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2989, "body": "Parks & Recreation Commission", "bodySlug": "parks-and-recreation-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-26", "startTime": "19:00", "videoId": "5y9qTEG7JuQ", "tpl": 19752, "items": [
      { "num": "4", "title": "Pickleball facility usage and expansion evaluation.", "topics": ["Parks & Open Space"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2869, "body": "Human Relations Commission", "bodySlug": "human-relations-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-14", "startTime": "18:00", "videoId": "KwzQ4ePsUY8", "tpl": 18932, "items": [
      { "num": "3", "title": "Consideration of HRC support for a community Pride Event on June 7, 2026 at King Plaza.", "topics": ["Arts & Culture"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 3030, "body": "Rail Committee", "bodySlug": "rail-committee", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-12", "startTime": "14:30", "videoId": "Iw8pmneLQfc", "tpl": 20016, "items": [
      { "num": "1", "title": "Alma Street–Charleston Road railroad crossing near-term Section 130 safety improvement project.", "topics": ["Transportation", "Crime, Policing, and Public Safety"], "schedTime": null, "elapsedSec": null },
      { "num": "2", "title": "Initial review of the 15% design development for grade separations at Churchill Avenue, Meadow Drive, and Charleston Road.", "topics": ["Transportation"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2780, "body": "Policy & Services Committee", "bodySlug": "policy-and-services-committee", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-12", "startTime": "18:00", "videoId": "d4zvaGBxqRs", "tpl": 18376, "items": [
      { "num": "1", "title": "City Auditor presentation of the Public Safety Staffing & Overtime Audit.", "topics": ["Crime, Policing, and Public Safety"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2812, "body": "Finance Committee", "bodySlug": "finance-committee", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-05", "startTime": "09:00", "videoId": "a2TkKDhnK5Y", "tpl": 18568, "items": [
      { "num": "1", "title": "FY 2027 Budget overview and strategies.", "topics": ["Budget & Taxes"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 2814, "body": "Finance Committee", "bodySlug": "finance-committee", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-19", "startTime": "13:00", "videoId": "NRKfB_E0x-M", "tpl": 18580, "items": [
      { "num": "1", "title": "FY 2027 budget wrap-up and recommended budget, including the FY 2027 Municipal Fee Schedule.", "topics": ["Budget & Taxes"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 3037, "body": "Climate Action & Sustainability Committee", "bodySlug": "climate-action-and-sustainability-committee", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-15", "startTime": "14:00", "videoId": "O-zZXZjFAKQ", "tpl": 20063, "items": [
      { "num": "1", "title": "Residential electrification status update and proposed principles for electrification programs to meet Air District regulations.", "topics": ["Climate & Utilities", "Housing"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 3100, "body": "Historic Resources Board", "bodySlug": "historic-resources-board", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-28", "startTime": "17:00", "videoId": null, "tpl": 20499, "items": [
      { "num": "1", "title": "Recognition of projects exemplifying excellence in historic preservation, rehabilitation, and restoration.", "topics": ["Historic Preservation"], "schedTime": "5:00 PM", "elapsedSec": 0 }
    ]},
    { "id": 2737, "body": "Public Art Commission", "bodySlug": "public-art-commission", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-21", "startTime": "19:00", "videoId": "zhHh0IXcjAM", "tpl": 18094, "items": [
      { "num": "2", "title": "Downtown Murals: approval of conceptual designs by artists Nigel Sussman and Mona Caron for temporary murals in downtown Palo Alto.", "topics": ["Arts & Culture", "Downtown & Business"], "schedTime": null, "elapsedSec": null },
      { "num": "4", "title": "Artlift Grants: approval of up to $50,000 for the next series of grants from the Art in Public Places fund.", "topics": ["Arts & Culture", "Budget & Taxes"], "schedTime": null, "elapsedSec": null }
    ]},
    { "id": 3040, "body": "Council Appointed Officer Committee", "bodySlug": "council-appointed-officer-committee", "bodyEmail": "city.clerk@PaloAlto.gov", "date": "2026-05-14", "startTime": "15:30", "videoId": "krjknS9l7pk", "tpl": 20083, "items": [
      { "num": "1", "title": "Review and discuss the Council Appointed Officers performance evaluation process and timeline for FY26.", "topics": ["Other"], "schedTime": null, "elapsedSec": null }
    ]}
  ],
  "news": [
    { "title": "Despite headwinds, city leaders place Cubberley sales tax onto ballot", "source": "Palo Alto Online", "date": "2026-06-09", "url": "https://www.paloaltoonline.com/city-government/2026/06/08/despite-headwinds-city-leaders-place-cubberley-sales-tax-onto-ballot/", "topics": ["Budget & Taxes", "Parks & Open Space"], "summary": "City leaders voted to place a sales-tax measure on the November ballot to help redevelop the Cubberley Community Center." },
    { "title": "Council puts sales tax on ballot to renovate Cubberley", "source": "Palo Alto Daily Post", "date": "2026-06-09", "url": "https://padailypost.com/2026/06/08/council-puts-sales-tax-on-ballot-to-renovate-cubberley/", "topics": ["Budget & Taxes", "Parks & Open Space"], "summary": "The City Council placed a half-cent sales tax on the Nov. 3 ballot to buy land and renovate buildings at Cubberley." },
    { "title": "Palo Alto sees wave of business openings as workers return to the office", "source": "Palo Alto Online", "date": "2026-06-09", "url": "https://www.paloaltoonline.com/business/2026/06/09/palo-alto-sees-wave-of-business-openings-as-workers-return-to-the-office/", "topics": ["Downtown & Business"], "summary": "Six new businesses are opening as downtown office workers return, reshaping the University Avenue scene." },
    { "title": "Planned office complex near San Antonio Road sparks debate", "source": "Palo Alto Online", "date": "2026-06-09", "url": "https://www.paloaltoonline.com/land-use/2026/06/09/planned-office-complex-near-san-antonio-road-sparks-debate/", "topics": ["Housing", "Downtown & Business"], "summary": "As Palo Alto plans a new residential community along San Antonio Road, a proposed office complex is drawing debate." },
    { "title": "Once known for resisting growth, Palo Alto now seeks 'pro-housing' designation", "source": "Palo Alto Online", "date": "2026-05-29", "url": "https://www.paloaltoonline.com/housing/2026/05/29/once-known-for-resisting-growth-palo-alto-now-seeks-pro-housing-designation/", "topics": ["Housing"], "summary": "The city is pursuing a state 'pro-housing' designation after historically falling short of its affordable-housing goals." },
    { "title": "Divided council signals support for 14-story tower project", "source": "Palo Alto Online", "date": "2026-05-19", "url": "https://www.paloaltoonline.com/housing/2026/05/19/divided-council-signals-support-for-14-story-tower-project/", "topics": ["Housing", "Downtown & Business"], "summary": "A divided council signaled support for a tower proposal at 156 California Ave, including a 14-story option." },
    { "title": "Council advances Cubberley measure toward November ballot", "source": "Palo Alto Online", "date": "2026-05-19", "url": "https://www.paloaltoonline.com/community/2026/05/18/council-sends-cubberley-measure-to-november-ballot/", "topics": ["Parks & Open Space", "Budget & Taxes"], "summary": "The Council moved the Cubberley redevelopment funding measure toward the November ballot." },
    { "title": "Fewer crossing guards? Less park irrigation? City faces tough budget choices", "source": "Palo Alto Online", "date": "2026-05-08", "url": "https://www.paloaltoonline.com/city-government/2026/05/08/fewer-crossing-guards-less-park-irrigation-city-faces-tough-budget-choices/", "topics": ["Budget & Taxes"], "summary": "Facing a tight budget, the city weighs cuts to services from crossing guards to park irrigation." }
  ]
};
