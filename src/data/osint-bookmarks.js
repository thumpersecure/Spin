// OSINT Framework Bookmarks - Based on osintframework.com
const OSINT_FRAMEWORK_BOOKMARKS = {
  'Username Search': [
    { name: 'Namechk', url: 'https://namechk.com/', description: 'Check username availability across platforms' },
    { name: 'KnowEm', url: 'https://knowem.com/', description: 'Username search across 500+ social networks' },
    { name: 'NameCheckup', url: 'https://namecheckup.com/', description: 'Check username availability' },
    { name: 'WhatsMyName', url: 'https://whatsmyname.app/', description: 'Username enumeration' },
    { name: 'Instant Username', url: 'https://instantusername.com/', description: 'Check username availability instantly' },
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Hunt down social media accounts' },
    { name: 'Maigret', url: 'https://github.com/soxoj/maigret', description: 'Collect person info by username' },
    { name: 'UserSearch.org', url: 'https://usersearch.org/', description: 'Find anyone online' }
  ],
  'Email Search': [
    { name: 'Hunter.io', url: 'https://hunter.io/', description: 'Find email addresses' },
    { name: 'Phonebook.cz', url: 'https://phonebook.cz/', description: 'Find emails and phone numbers' },
    { name: 'Email Checker', url: 'https://email-checker.net/', description: 'Verify email addresses' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', description: 'Check if email was in a breach' },
    { name: 'EmailRep', url: 'https://emailrep.io/', description: 'Email reputation lookup' },
    { name: 'Epieos', url: 'https://epieos.com/', description: 'Google account email lookup' },
    { name: 'Holehe', url: 'https://github.com/megadose/holehe', description: 'Check email registered accounts' },
    { name: 'Snov.io', url: 'https://snov.io/', description: 'Email finder and verifier' },
    { name: 'Clearbit Connect', url: 'https://clearbit.com/connect', description: 'Find emails in Gmail' },
    { name: 'VoilaNorbert', url: 'https://www.voilanorbert.com/', description: 'Find anyone\'s email' }
  ],
  'Phone Number': [
    { name: 'Truecaller', url: 'https://www.truecaller.com/', description: 'Phone number lookup' },
    { name: 'NumLooker', url: 'https://www.numlooker.com/', description: 'Reverse phone lookup' },
    { name: 'PhoneInfoga', url: 'https://github.com/sundowndev/phoneinfoga', description: 'Phone number investigation' },
    { name: 'Sync.me', url: 'https://sync.me/', description: 'Caller ID and spam blocker' },
    { name: 'CallerID Test', url: 'https://calleridtest.com/', description: 'Caller ID lookup' },
    { name: 'SpyDialer', url: 'https://spydialer.com/', description: 'Free reverse phone lookup' },
    { name: 'CNAM Lookup', url: 'https://www.opencnam.com/', description: 'Caller ID lookup API' }
  ],
  'Social Media': [
    { name: 'Social Searcher', url: 'https://www.social-searcher.com/', description: 'Free social media search' },
    { name: 'TweetDeck', url: 'https://tweetdeck.twitter.com/', description: 'Twitter dashboard' },
    { name: 'Twint', url: 'https://github.com/twintproject/twint', description: 'Twitter scraping tool' },
    { name: 'InstaLoader', url: 'https://github.com/instaloader/instaloader', description: 'Instagram downloader' },
    { name: 'Osintgram', url: 'https://github.com/Datalux/Osintgram', description: 'Instagram OSINT tool' },
    { name: 'Facebook Graph', url: 'https://graph.facebook.com/', description: 'Facebook Graph API' },
    { name: 'Who Posted What', url: 'https://whopostedwhat.com/', description: 'Facebook keyword search' },
    { name: 'LinkedIn X-Ray', url: 'https://recruitin.net/', description: 'LinkedIn X-Ray search' },
    { name: 'Social Blade', url: 'https://socialblade.com/', description: 'Social media statistics' },
    { name: 'Exportcomments', url: 'https://exportcomments.com/', description: 'Export comments from social media' }
  ],
  'Domain & IP': [
    { name: 'Whois Lookup', url: 'https://whois.domaintools.com/', description: 'Domain registration info' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/', description: 'DNS and domain history' },
    { name: 'ViewDNS', url: 'https://viewdns.info/', description: 'DNS tools and information' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com/', description: 'DNS reconnaissance' },
    { name: 'Shodan', url: 'https://www.shodan.io/', description: 'Search engine for IoT devices' },
    { name: 'Censys', url: 'https://censys.io/', description: 'Internet-wide scanning' },
    { name: 'VirusTotal', url: 'https://www.virustotal.com/', description: 'Analyze files and URLs' },
    { name: 'URLScan', url: 'https://urlscan.io/', description: 'Website scanner' },
    { name: 'Robtex', url: 'https://www.robtex.com/', description: 'IP and domain lookup' },
    { name: 'IPinfo', url: 'https://ipinfo.io/', description: 'IP address data' },
    { name: 'MXToolbox', url: 'https://mxtoolbox.com/', description: 'DNS and email tools' },
    { name: 'BGPView', url: 'https://bgpview.io/', description: 'BGP data and analytics' },
    { name: 'crt.sh', url: 'https://crt.sh/', description: 'Certificate Transparency logs' },
    { name: 'Subfinder', url: 'https://github.com/projectdiscovery/subfinder', description: 'Subdomain discovery' }
  ],
  'Image Analysis': [
    { name: 'Google Images', url: 'https://images.google.com/', description: 'Reverse image search' },
    { name: 'TinEye', url: 'https://tineye.com/', description: 'Reverse image search' },
    { name: 'Yandex Images', url: 'https://yandex.com/images/', description: 'Russian reverse image search' },
    { name: 'PimEyes', url: 'https://pimeyes.com/', description: 'Face recognition search' },
    { name: 'FaceCheck.ID', url: 'https://facecheck.id/', description: 'Face search engine' },
    { name: 'Jeffrey\'s Exif Viewer', url: 'http://exif.regex.info/exif.cgi', description: 'EXIF metadata viewer' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com/', description: 'Image forensics' },
    { name: 'Image Edited?', url: 'https://imageedited.com/', description: 'Detect image manipulation' },
    { name: 'Pic2Map', url: 'https://www.pic2map.com/', description: 'View photo EXIF location' },
    { name: 'Remove.bg', url: 'https://www.remove.bg/', description: 'Remove image backgrounds' }
  ],
  'Geolocation': [
    { name: 'Google Maps', url: 'https://www.google.com/maps', description: 'Mapping and street view' },
    { name: 'Google Earth', url: 'https://earth.google.com/', description: 'Satellite imagery' },
    { name: 'Bing Maps', url: 'https://www.bing.com/maps', description: 'Aerial imagery' },
    { name: 'Wikimapia', url: 'https://wikimapia.org/', description: 'Editable mapping site' },
    { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', description: 'Open source maps' },
    { name: 'Mapillary', url: 'https://www.mapillary.com/', description: 'Street-level imagery' },
    { name: 'GeoGuessr', url: 'https://www.geoguessr.com/', description: 'Geography game for training' },
    { name: 'SunCalc', url: 'https://www.suncalc.org/', description: 'Sun position calculator' },
    { name: 'ShadowCalculator', url: 'https://shadowcalculator.eu/', description: 'Shadow length calculator' },
    { name: 'FlightRadar24', url: 'https://www.flightradar24.com/', description: 'Live flight tracker' },
    { name: 'MarineTraffic', url: 'https://www.marinetraffic.com/', description: 'Ship tracking' },
    { name: 'Webcam Search', url: 'https://www.insecam.org/', description: 'Public webcam search' }
  ],
  'People Search': [
    { name: 'Pipl', url: 'https://pipl.com/', description: 'People search engine' },
    { name: 'ThatsThem', url: 'https://thatsthem.com/', description: 'Free people search' },
    { name: 'Whitepages', url: 'https://www.whitepages.com/', description: 'People and phone lookup' },
    { name: 'Spokeo', url: 'https://www.spokeo.com/', description: 'People search' },
    { name: 'FastPeopleSearch', url: 'https://www.fastpeoplesearch.com/', description: 'Free people finder' },
    { name: 'FamilyTreeNow', url: 'https://www.familytreenow.com/', description: 'Family tree and records' },
    { name: 'Radaris', url: 'https://radaris.com/', description: 'People search and background' },
    { name: 'BeenVerified', url: 'https://www.beenverified.com/', description: 'Background checks' },
    { name: 'PeekYou', url: 'https://www.peekyou.com/', description: 'People search engine' },
    { name: 'WebMii', url: 'https://webmii.com/', description: 'People search' }
  ],
  'Document & File Search': [
    { name: 'Google Dork', url: 'https://www.google.com/advanced_search', description: 'Advanced Google search' },
    { name: 'Scribd', url: 'https://www.scribd.com/', description: 'Document sharing platform' },
    { name: 'SlideShare', url: 'https://www.slideshare.net/', description: 'Presentation sharing' },
    { name: 'Archive.org', url: 'https://archive.org/', description: 'Internet Archive' },
    { name: 'Wayback Machine', url: 'https://web.archive.org/', description: 'Historical web pages' },
    { name: 'CachedView', url: 'https://cachedview.com/', description: 'View cached pages' },
    { name: 'Pastebin', url: 'https://pastebin.com/', description: 'Text sharing service' },
    { name: 'GitHub Code Search', url: 'https://github.com/search', description: 'Search public code' },
    { name: 'PublicWWW', url: 'https://publicwww.com/', description: 'Source code search' },
    { name: 'OCCRP Aleph', url: 'https://aleph.occrp.org/', description: 'Global investigation archive' }
  ],
  'Dark Web': [
    { name: 'Ahmia', url: 'https://ahmia.fi/', description: 'Tor search engine' },
    { name: 'OnionSearch', url: 'https://onionsearchengine.com/', description: 'Dark web search' },
    { name: 'Torch', url: 'http://xmh57jrzrnw6insl.onion/', description: 'Tor search engine (Tor required)' },
    { name: 'DarkSearch', url: 'https://darksearch.io/', description: 'Dark web search API' },
    { name: 'Onion.live', url: 'https://onion.live/', description: 'Onion link aggregator' }
  ],
  'Business & Company': [
    { name: 'OpenCorporates', url: 'https://opencorporates.com/', description: 'Company database' },
    { name: 'Crunchbase', url: 'https://www.crunchbase.com/', description: 'Company information' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/', description: 'Professional network' },
    { name: 'Glassdoor', url: 'https://www.glassdoor.com/', description: 'Company reviews' },
    { name: 'SEC EDGAR', url: 'https://www.sec.gov/edgar/', description: 'SEC filings' },
    { name: 'Companies House', url: 'https://www.gov.uk/government/organisations/companies-house', description: 'UK company info' },
    { name: 'ICIJ Offshore Leaks', url: 'https://offshoreleaks.icij.org/', description: 'Offshore company data' },
    { name: 'LEI Search', url: 'https://search.gleif.org/', description: 'Legal entity identifier lookup' },
    { name: 'Dun & Bradstreet', url: 'https://www.dnb.com/', description: 'Business data' }
  ],
  'Cryptocurrency': [
    { name: 'Blockchain Explorer', url: 'https://www.blockchain.com/explorer', description: 'Bitcoin explorer' },
    { name: 'Etherscan', url: 'https://etherscan.io/', description: 'Ethereum explorer' },
    { name: 'WalletExplorer', url: 'https://www.walletexplorer.com/', description: 'Bitcoin wallet explorer' },
    { name: 'BitInfoCharts', url: 'https://bitinfocharts.com/', description: 'Crypto charts and data' },
    { name: 'Chainalysis', url: 'https://www.chainalysis.com/', description: 'Blockchain analysis' },
    { name: 'OXT', url: 'https://oxt.me/', description: 'Bitcoin explorer' }
  ],
  'Threat Intelligence': [
    { name: 'VirusTotal', url: 'https://www.virustotal.com/', description: 'Malware analysis' },
    { name: 'Hybrid Analysis', url: 'https://www.hybrid-analysis.com/', description: 'Malware sandbox' },
    { name: 'Any.run', url: 'https://any.run/', description: 'Interactive malware sandbox' },
    { name: 'URLhaus', url: 'https://urlhaus.abuse.ch/', description: 'Malicious URL database' },
    { name: 'AlienVault OTX', url: 'https://otx.alienvault.com/', description: 'Open threat exchange' },
    { name: 'GreyNoise', url: 'https://www.greynoise.io/', description: 'Internet noise analysis' },
    { name: 'ThreatCrowd', url: 'https://threatcrowd.org/', description: 'Threat intelligence' },
    { name: 'Pulsedive', url: 'https://pulsedive.com/', description: 'Threat intelligence' },
    { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com/', description: 'IP abuse database' },
    { name: 'ThreatMiner', url: 'https://www.threatminer.org/', description: 'Threat intelligence portal' }
  ],
  'Breach Data': [
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', description: 'Check breach status' },
    { name: 'DeHashed', url: 'https://dehashed.com/', description: 'Breach search engine' },
    { name: 'LeakCheck', url: 'https://leakcheck.io/', description: 'Data leak checker' },
    { name: 'IntelX', url: 'https://intelx.io/', description: 'Intelligence search engine' },
    { name: 'Snusbase', url: 'https://snusbase.com/', description: 'Data breach search' },
    { name: 'LeakPeek', url: 'https://leakpeek.com/', description: 'Leak search engine' }
  ],
  'Wi-Fi & Wireless': [
    { name: 'WiGLE', url: 'https://wigle.net/', description: 'Wireless network mapping' },
    { name: 'OpenWiFiMap', url: 'https://openwifimap.net/', description: 'Open WiFi map' },
    { name: 'Router Passwords', url: 'https://www.routerpasswords.com/', description: 'Default router passwords' }
  ],
  'Code & Dev': [
    { name: 'GitHub', url: 'https://github.com/', description: 'Code hosting' },
    { name: 'GitLab', url: 'https://gitlab.com/', description: 'DevOps platform' },
    { name: 'Bitbucket', url: 'https://bitbucket.org/', description: 'Code hosting' },
    { name: 'Searchcode', url: 'https://searchcode.com/', description: 'Source code search' },
    { name: 'grep.app', url: 'https://grep.app/', description: 'Search across repos' },
    { name: 'Libraries.io', url: 'https://libraries.io/', description: 'Package search' },
    { name: 'npm', url: 'https://www.npmjs.com/', description: 'Node.js packages' },
    { name: 'PyPI', url: 'https://pypi.org/', description: 'Python packages' }
  ],
  'News & Media': [
    { name: 'Google News', url: 'https://news.google.com/', description: 'News aggregator' },
    { name: 'DuckDuckGo News', url: 'https://duckduckgo.com/?iar=news', description: 'Private news search' },
    { name: 'News Now', url: 'https://www.newsnow.co.uk/', description: 'UK news aggregator' },
    { name: 'Feedly', url: 'https://feedly.com/', description: 'RSS reader' },
    { name: 'Newspapers.com', url: 'https://www.newspapers.com/', description: 'Historical newspapers' },
    { name: 'ProQuest', url: 'https://www.proquest.com/', description: 'Academic database' }
  ]
};

// Awesome OSINT Bookmarks - Based on github.com/jivoi/awesome-osint
const AWESOME_OSINT_BOOKMARKS = {
  'General Search': [
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/', description: 'Privacy-focused search engine' },
    { name: 'Startpage', url: 'https://www.startpage.com/', description: 'Private Google results' },
    { name: 'Searx', url: 'https://searx.space/', description: 'Metasearch engine instances' },
    { name: 'Qwant', url: 'https://www.qwant.com/', description: 'European privacy search' },
    { name: 'Brave Search', url: 'https://search.brave.com/', description: 'Independent search engine' },
    { name: 'Mojeek', url: 'https://www.mojeek.com/', description: 'Independent search engine' },
    { name: 'Yacy', url: 'https://yacy.net/', description: 'Decentralized search' }
  ],
  'Meta Search': [
    { name: 'Dogpile', url: 'https://www.dogpile.com/', description: 'Metasearch engine' },
    { name: 'Etools.ch', url: 'https://www.etools.ch/', description: 'Swiss metasearch' },
    { name: 'Zapmeta', url: 'https://www.zapmeta.com/', description: 'Metasearch' }
  ],
  'Specialty Search': [
    { name: 'Carrot2', url: 'https://search.carrot2.org/', description: 'Clustering search results' },
    { name: 'Boardreader', url: 'https://boardreader.com/', description: 'Forum search' },
    { name: 'Million Short', url: 'https://millionshort.com/', description: 'Remove top results' },
    { name: 'Intelligence X', url: 'https://intelx.io/', description: 'Search darknet and more' }
  ],
  'Data Visualization': [
    { name: 'Maltego', url: 'https://www.maltego.com/', description: 'Link analysis tool' },
    { name: 'Gephi', url: 'https://gephi.org/', description: 'Graph visualization' },
    { name: 'Linkurious', url: 'https://linkurious.com/', description: 'Graph analytics' },
    { name: 'yEd', url: 'https://www.yworks.com/products/yed', description: 'Graph editor' }
  ],
  'Collaboration': [
    { name: 'Hunchly', url: 'https://hunch.ly/', description: 'Web capture for investigations' },
    { name: 'Paliscope', url: 'https://www.paliscope.com/', description: 'Investigation platform' },
    { name: 'OSINT Combine', url: 'https://www.osintcombine.com/', description: 'OSINT tools collection' }
  ],
  'Geospatial': [
    { name: 'Bellingcat Maps', url: 'https://www.bellingcat.com/category/resources/', description: 'Investigation resources' },
    { name: 'Sentinel Hub', url: 'https://www.sentinel-hub.com/', description: 'Satellite imagery' },
    { name: 'Zoom Earth', url: 'https://zoom.earth/', description: 'Live weather satellite' },
    { name: 'EOS Land Viewer', url: 'https://eos.com/landviewer/', description: 'Satellite imagery' },
    { name: 'Maxar', url: 'https://www.maxar.com/', description: 'Commercial satellite' },
    { name: 'Planet', url: 'https://www.planet.com/', description: 'Daily satellite imagery' }
  ],
  'Transportation': [
    { name: 'FlightAware', url: 'https://flightaware.com/', description: 'Flight tracking' },
    { name: 'ADS-B Exchange', url: 'https://www.adsbexchange.com/', description: 'Unfiltered flight data' },
    { name: 'VesselFinder', url: 'https://www.vesselfinder.com/', description: 'Ship tracking' },
    { name: 'OpenRailwayMap', url: 'https://www.openrailwaymap.org/', description: 'Railway infrastructure' },
    { name: 'Live ATC', url: 'https://www.liveatc.net/', description: 'ATC radio' }
  ],
  'Verification Tools': [
    { name: 'InVID', url: 'https://www.invid-project.eu/', description: 'Video verification' },
    { name: 'Fake Image Detector', url: 'https://www.fakeimagedetector.com/', description: 'Image authenticity' },
    { name: 'Google Fact Check', url: 'https://toolbox.google.com/factcheck/', description: 'Fact checking tools' },
    { name: 'CrowdTangle', url: 'https://www.crowdtangle.com/', description: 'Social media insights' }
  ],
  'Government & Legal': [
    { name: 'PACER', url: 'https://pacer.uscourts.gov/', description: 'US court records' },
    { name: 'CourtListener', url: 'https://www.courtlistener.com/', description: 'Free court opinions' },
    { name: 'GovInfo', url: 'https://www.govinfo.gov/', description: 'US government publications' },
    { name: 'Congress.gov', url: 'https://www.congress.gov/', description: 'US legislation' },
    { name: 'FOIA.gov', url: 'https://www.foia.gov/', description: 'Freedom of Information' },
    { name: 'EU Whoiswho', url: 'https://op.europa.eu/en/web/who-is-who', description: 'EU officials directory' }
  ],
  'Academic': [
    { name: 'Google Scholar', url: 'https://scholar.google.com/', description: 'Academic search' },
    { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org/', description: 'AI research search' },
    { name: 'BASE', url: 'https://www.base-search.net/', description: 'Academic search' },
    { name: 'CORE', url: 'https://core.ac.uk/', description: 'Open access research' },
    { name: 'ResearchGate', url: 'https://www.researchgate.net/', description: 'Research network' },
    { name: 'arXiv', url: 'https://arxiv.org/', description: 'Preprint server' },
    { name: 'Sci-Hub', url: 'https://sci-hub.se/', description: 'Research papers access' }
  ],
  'Language & Translation': [
    { name: 'DeepL', url: 'https://www.deepl.com/', description: 'AI translation' },
    { name: 'Google Translate', url: 'https://translate.google.com/', description: 'Translation service' },
    { name: 'Linguee', url: 'https://www.linguee.com/', description: 'Dictionary and translation' }
  ]
};

// Kali Linux OSINT Tools with GitHub links
const KALI_OSINT_TOOLS = {
  'Reconnaissance': [
    { name: 'theHarvester', url: 'https://github.com/laramies/theHarvester', description: 'Email, subdomain, and name harvester' },
    { name: 'Recon-ng', url: 'https://github.com/lanmaster53/recon-ng', description: 'Web reconnaissance framework' },
    { name: 'Maltego', url: 'https://www.maltego.com/', description: 'Interactive data mining tool' },
    { name: 'SpiderFoot', url: 'https://github.com/smicallef/spiderfoot', description: 'Automated OSINT tool' },
    { name: 'Amass', url: 'https://github.com/owasp-amass/amass', description: 'Network mapping and attack surface' },
    { name: 'Sublist3r', url: 'https://github.com/aboul3la/Sublist3r', description: 'Subdomain enumeration' },
    { name: 'Photon', url: 'https://github.com/s0md3v/Photon', description: 'Fast crawler designed for OSINT' }
  ],
  'Social Engineering': [
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Hunt down social media accounts' },
    { name: 'Social-Engineer Toolkit', url: 'https://github.com/trustedsec/social-engineer-toolkit', description: 'Penetration testing framework' },
    { name: 'Maltego', url: 'https://www.maltego.com/', description: 'Link analysis' }
  ],
  'Email Analysis': [
    { name: 'Infoga', url: 'https://github.com/m4ll0k/Infoga', description: 'Email information gathering' },
    { name: 'theHarvester', url: 'https://github.com/laramies/theHarvester', description: 'Email harvesting' },
    { name: 'holehe', url: 'https://github.com/megadose/holehe', description: 'Email registration checker' },
    { name: 'h8mail', url: 'https://github.com/khast3x/h8mail', description: 'Email OSINT and breach hunting' }
  ],
  'Username OSINT': [
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Username search' },
    { name: 'Maigret', url: 'https://github.com/soxoj/maigret', description: 'Username lookup on many sites' },
    { name: 'WhatsMyName', url: 'https://github.com/WebBreacher/WhatsMyName', description: 'Username enumeration' },
    { name: 'social-analyzer', url: 'https://github.com/qeeqbox/social-analyzer', description: 'Analyze social media profiles' }
  ],
  'Phone OSINT': [
    { name: 'PhoneInfoga', url: 'https://github.com/sundowndev/phoneinfoga', description: 'Phone number information gathering' },
    { name: 'Moriarty', url: 'https://github.com/AzizKpln/Moriarty-Project', description: 'Phone number investigation' }
  ],
  'Web Analysis': [
    { name: 'Whatweb', url: 'https://github.com/urbanadventurer/WhatWeb', description: 'Web scanner' },
    { name: 'Wappalyzer', url: 'https://github.com/wappalyzer/wappalyzer', description: 'Technology profiler' },
    { name: 'BuiltWith', url: 'https://builtwith.com/', description: 'Web technology profiler' },
    { name: 'Waybackpack', url: 'https://github.com/jsvine/waybackpack', description: 'Download from Wayback Machine' }
  ],
  'DNS & Domain': [
    { name: 'DNSenum', url: 'https://github.com/fwaeytens/dnsenum', description: 'DNS enumeration' },
    { name: 'DNSrecon', url: 'https://github.com/darkoperator/dnsrecon', description: 'DNS enumeration' },
    { name: 'Fierce', url: 'https://github.com/mschwager/fierce', description: 'DNS reconnaissance' },
    { name: 'Subfinder', url: 'https://github.com/projectdiscovery/subfinder', description: 'Subdomain discovery' },
    { name: 'Assetfinder', url: 'https://github.com/tomnomnom/assetfinder', description: 'Find domains and subdomains' },
    { name: 'Findomain', url: 'https://github.com/Findomain/Findomain', description: 'Subdomain finder' }
  ],
  'Network Scanning': [
    { name: 'Nmap', url: 'https://github.com/nmap/nmap', description: 'Network scanner' },
    { name: 'Masscan', url: 'https://github.com/robertdavidgraham/masscan', description: 'Mass IP port scanner' },
    { name: 'Netcat', url: 'https://nc110.sourceforge.io/', description: 'Network utility' }
  ],
  'Image OSINT': [
    { name: 'Exiftool', url: 'https://github.com/exiftool/exiftool', description: 'Metadata reader/writer' },
    { name: 'Metagoofil', url: 'https://github.com/laramies/metagoofil', description: 'Metadata harvester' }
  ],
  'Geolocation': [
    { name: 'Creepy', url: 'https://github.com/ilektrojohn/creepy', description: 'Geolocation OSINT' },
    { name: 'GeoSpy', url: 'https://github.com/atiilla/geospy', description: 'Geolocation tracking' }
  ],
  'GitHub & Code': [
    { name: 'GitRob', url: 'https://github.com/michenriksen/gitrob', description: 'GitHub sensitive data finder' },
    { name: 'GitLeaks', url: 'https://github.com/gitleaks/gitleaks', description: 'Secret scanning' },
    { name: 'TruffleHog', url: 'https://github.com/trufflesecurity/trufflehog', description: 'Secret detection' },
    { name: 'GitDorker', url: 'https://github.com/obheda12/GitDorker', description: 'GitHub dorking' }
  ],
  'Wireless': [
    { name: 'WiFi-Pumpkin', url: 'https://github.com/P0cL4bs/WiFi-Pumpkin-deprecated', description: 'Rogue AP framework' },
    { name: 'Aircrack-ng', url: 'https://github.com/aircrack-ng/aircrack-ng', description: 'WiFi security auditing' }
  ],
  'Automation': [
    { name: 'Osmedeus', url: 'https://github.com/j3ssie/osmedeus', description: 'Automated recon framework' },
    { name: 'Sn1per', url: 'https://github.com/1N3/Sn1per', description: 'Automated pentest framework' },
    { name: 'OWASP Maryam', url: 'https://github.com/saeeddhqan/Maryam', description: 'OSINT framework' },
    { name: 'Raccoon', url: 'https://github.com/evyatarmeged/Raccoon', description: 'Offensive security tool' }
  ],
  'Browser Extensions': [
    { name: 'Wappalyzer', url: 'https://github.com/wappalyzer/wappalyzer', description: 'Technology profiler extension' },
    { name: 'Shodan', url: 'https://chrome.google.com/webstore/detail/shodan/jjalcfnidlmpjhdfepjhjbhnhkbgleap', description: 'Shodan browser extension' },
    { name: 'EXIF Viewer', url: 'https://github.com/nickarino/exif-viewer', description: 'View image metadata' }
  ],
  'Threat Intel': [
    { name: 'MISP', url: 'https://github.com/MISP/MISP', description: 'Threat intelligence platform' },
    { name: 'OpenCTI', url: 'https://github.com/OpenCTI-Platform/opencti', description: 'Cyber threat intelligence' },
    { name: 'Yeti', url: 'https://github.com/yeti-platform/yeti', description: 'Threat intelligence repository' }
  ]
};

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OSINT_FRAMEWORK_BOOKMARKS,
    AWESOME_OSINT_BOOKMARKS,
    KALI_OSINT_TOOLS
  };
}
