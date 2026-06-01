
export const LEARN_TAXONOMY = [
  {
    id: '1',
    title: 'AIR POLLUTION BASICS',
    description: 'Master the fundamental concepts of air quality, pollutants, and why they matter for our world.',
    icon: 'cloud-queue',
    color: '#3B82F6', // Blue
    subCategories: [
      {
        id: '1.1',
        title: 'What is Air Pollution?',
        topics: [
          {
            id: '1.1.1',
            title: 'Definition',
            content: 'Air pollution is the presence of substances in the atmosphere that are harmful to the health of humans and other living beings, or cause damage to the climate or to materials. These substances can be solid particles, liquid droplets, or gases.'
          },
          {
            id: '1.1.2',
            title: 'Types of Pollution',
            content: 'Pollution is broadly categorized into Outdoor (Ambient) and Indoor pollution. Outdoor pollution includes smog and industrial emissions, while indoor pollution includes smoke from cooking, cleaning agents, and building materials.'
          },
          {
            id: '1.1.3',
            title: 'Primary vs Secondary Pollutants',
            content: 'Primary pollutants are emitted directly from a source (like CO from a car tailpipe). Secondary pollutants form in the atmosphere through chemical reactions (like Ground-level Ozone formed from NOx and VOCs in sunlight).'
          },
          {
            id: '1.1.4',
            title: 'Air Quality vs Weather',
            content: 'Air quality refers to the concentration of pollutants, while weather refers to atmospheric conditions like temperature and rain. However, they are linked: wind can disperse pollution, while temperature inversions can trap it near the ground.'
          },
          {
            id: '1.1.5',
            title: 'Smog and Haze',
            content: 'Smog is a contraction of "smoke" and "fog". It occurs when pollutants react with sunlight. Haze is caused by fine particles scattering light, which reduces visibility and gives the air a brownish or greyish tint.'
          },
          {
            id: '1.1.6',
            title: 'Urban Heat Island Effect',
            content: 'Cities are often warmer than surrounding rural areas due to human activities and heat-absorbing surfaces like asphalt. This increased temperature can accelerate the formation of secondary pollutants like ozone.'
          }
        ]
      },
      {
        id: '1.2',
        title: 'Why Air Pollution Matters',
        topics: [
          {
            id: '1.2.1',
            title: 'Human Health Impacts',
            content: 'Pollution is a "silent killer". It causes respiratory diseases (Asthma, COPD), cardiovascular issues (Stroke, Heart Attack), and can even impact mental health and cognitive development in children.'
          },
          {
            id: '1.2.2',
            title: 'Climate Impacts',
            content: 'Many air pollutants are also Greenhouse Gases (like Ozone and Black Carbon). They trap heat in the atmosphere, contributing directly to global warming and extreme weather events.'
          },
          {
            id: '1.2.3',
            title: 'Economic Losses',
            content: 'Air pollution costs the global economy trillions of dollars in health costs, lost labor productivity, and damage to agricultural crops.'
          },
          {
            id: '1.2.4',
            title: 'Impact on Children',
            content: 'Children breathe faster than adults and their organs are still developing, making them highly vulnerable to permanent lung damage and neurodevelopmental issues from polluted air.'
          }
        ]
      },
      {
        id: '1.3',
        title: 'History of Air Pollution in India',
        topics: [
          {
            id: '1.3.1',
            title: 'Evolution of Pollution',
            content: 'India\'s pollution journey moved from indoor biomass burning in villages to industrial and vehicular emissions in rapidly growing mega-cities over the last 50 years.'
          },
          {
            id: '1.3.2',
            title: 'Pune Pollution Timeline',
            content: 'Once known as the "Bicycle City", Pune\'s rapid transition to motorized transport and construction boom has led to significant spikes in PM2.5 and NO2 levels over the last two decades.'
          },
          {
            id: '1.3.3',
            title: 'National Clean Air Programme (NCAP)',
            content: 'Launched in 2019, NCAP is India\'s first-ever time-bound national framework for air quality management, aiming for a 20-30% reduction in particulate matter concentrations by 2024.'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'UNDERSTANDING AQI',
    description: 'Learn how to read the numbers, what they mean for your health, and how the index is calculated.',
    icon: 'assessment',
    color: '#10B981', // Green
    subCategories: [
      {
        id: '2.1',
        title: 'What is AQI?',
        topics: [
          {
            id: '2.1.1',
            title: 'AQI Definition',
            content: 'The Air Quality Index (AQI) is a tool used by government agencies to communicate to the public how polluted the air currently is or how polluted it is forecast to become. It turns complex pollutant concentrations into a simple number between 0 and 500.'
          },
          {
            id: '2.1.2',
            title: 'Why AQI Exists',
            content: 'Raw pollutant data (like 60 µg/m³ of PM2.5) is hard for the general public to understand. AQI exists to provide a clear, color-coded scale that tells you immediately whether it is safe to go outside or if you need to take precautions.'
          },
          {
            id: '2.1.3',
            title: 'Categories & Colors',
            content: 'The Indian AQI has 6 categories: Good (Green), Satisfactory (Light Green), Moderate (Yellow), Poor (Orange), Very Poor (Red), and Severe (Dark Red). Each category is associated with different health impacts.'
          }
        ]
      },
      {
        id: '2.2',
        title: 'AQI Scale Interpretation',
        topics: [
          {
            id: '2.2.1',
            title: '0–100: Safe Zone',
            content: '0-50 (Good): Minimal impact. 51-100 (Satisfactory): May cause minor breathing discomfort to sensitive people. For most, this range is safe for all outdoor activities.'
          },
          {
            id: '2.2.2',
            title: '101–300: Caution Zone',
            content: '101-200 (Moderate): Discomfort to people with lungs/heart disease. 201-300 (Poor): Breathing discomfort to most people on prolonged exposure.'
          },
          {
            id: '2.2.3',
            title: '301–500: Danger Zone',
            content: '301-400 (Very Poor): Respiratory illness on prolonged exposure. 401-500 (Severe): Affects healthy people and seriously impacts those with existing diseases. Emergency measures are usually triggered here.'
          }
        ]
      },
      {
        id: '2.3',
        title: 'How AQI is Calculated',
        topics: [
          {
            id: '2.3.1',
            title: 'The Sub-Index Method',
            content: 'Individual AQI scores (sub-indices) are calculated for 8 pollutants (PM10, PM2.5, NO2, SO2, CO, O3, NH3, and Pb). The calculation uses linear interpolation between predefined concentration breakpoints.'
          },
          {
            id: '2.3.2',
            title: 'Worst Pollutant Principle',
            content: 'The overall AQI for a location is the highest (worst) sub-index among all the pollutants measured. For example, if PM2.5 gives an AQI of 150 and NO2 gives 50, the reported AQI is 150.'
          },
          {
            id: '2.3.3',
            title: 'Averaging Periods',
            content: 'Different pollutants are averaged over different times. Particulate matter (PM2.5/PM10) uses a 24-hour running average, while Ozone (O3) and Carbon Monoxide (CO) use 1-hour or 8-hour averages.'
          }
        ]
      },
      {
        id: '2.4',
        title: 'AQI Standards',
        topics: [
          {
            id: '2.4.1',
            title: 'Indian vs WHO Standards',
            content: 'Indian standards are generally more relaxed than WHO guidelines. For example, the 24-hour PM2.5 limit in India is 60 µg/m³, while WHO recommends staying below 15 µg/m³.'
          },
          {
            id: '2.4.2',
            title: 'AQI Limitations',
            content: 'AQI is a great general indicator but it may not capture specific toxic chemicals or local "hotspots" like a neighbor burning trash or a diesel generator running next door.'
          }
        ]
      },
      {
        id: '2.5',
        title: 'Monitoring Stations',
        topics: [
          {
            id: '2.5.1',
            title: 'What is a CAAQMS?',
            content: 'Continuous Ambient Air Quality Monitoring Stations (CAAQMS) are highly accurate, expensive laboratories that measure pollutants 24/7. They are the gold standard for city-wide data.'
          },
          {
            id: '2.5.2',
            title: 'Technologies Used',
            content: 'Stations use Beta Attenuation Monitoring (BAM) for dust, Chemiluminescence for NO2, and UV Photometry for Ozone to ensure scientific-grade accuracy.'
          }
        ]
      },
      {
        id: '2.6',
        title: 'Real-time Features',
        topics: [
          {
            id: '2.6.1',
            title: 'Maps & Heatmaps',
            content: 'Heatmaps help visualize how pollution flows across a city, showing which areas are currently the most impacted by wind patterns and local sources.'
          },
          {
            id: '2.6.2',
            title: 'Forecast AQI',
            content: 'Using meteorological models and historical data, scientists can predict if AQI will improve or worsen over the next 48-72 hours, allowing you to plan your week.'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'POLLUTANTS DEEP DIVE',
    description: 'A detailed look at PM2.5, PM10, Nitrogen Dioxide, Ozone, and other invisible threats.',
    icon: 'biotech',
    color: '#F59E0B', // Orange
    subCategories: [
      {
        id: '3.1',
        title: 'PM2.5: The Tiny Killer',
        topics: [
          {
            id: '3.1.1',
            title: 'What is PM2.5?',
            content: 'Particulate Matter 2.5 refers to particles that are 2.5 microns or less in diameter—about 30 times smaller than a human hair. They are so small they can only be seen with an electron microscope.'
          },
          {
            id: '3.1.2',
            title: 'Why is it Dangerous?',
            content: 'Because of their tiny size, PM2.5 particles can bypass the nose and throat and penetrate deep into the lungs, eventually entering the bloodstream. This can cause inflammation and cardiovascular diseases.'
          },
          {
            id: '3.1.3',
            title: 'Common Sources',
            content: 'Major sources include vehicle exhausts, power plants, residential wood burning, forest fires, agricultural burning, and some industrial processes.'
          }
        ]
      },
      {
        id: '3.2',
        title: 'PM10: Coarse Particles',
        topics: [
          {
            id: '3.2.1',
            title: 'Dust & Construction',
            content: 'PM10 particles are larger (up to 10 microns) and primarily consist of dust from roads, construction sites, and landfills. While less invasive than PM2.5, they still cause significant respiratory irritation.'
          },
          {
            id: '3.2.2',
            title: 'Seasonal Variations',
            content: 'PM10 levels often spike during dry, windy seasons and in areas with heavy construction activity. They can be naturally occurring (like sandstorms) or human-made.'
          }
        ]
      },
      {
        id: '3.3',
        title: 'Carbon Monoxide (CO)',
        topics: [
          {
            id: '3.3.1',
            title: 'The Silent Gas',
            content: 'CO is a colorless, odorless gas. In outdoor environments, it mostly comes from vehicle emissions. Indoors, it can come from faulty heaters or cooking with biomass in unventilated spaces.'
          },
          {
            id: '3.3.2',
            title: 'Symptoms of Poisoning',
            content: 'CO binds to hemoglobin in the blood, reducing its ability to carry oxygen. High levels can cause dizziness, headaches, confusion, and in extreme cases, unconsciousness.'
          }
        ]
      },
      {
        id: '3.4',
        title: 'Nitrogen Dioxide (NO2)',
        topics: [
          {
            id: '3.4.1',
            title: 'Traffic & Industry',
            content: 'NO2 is a gaseous pollutant primarily produced by burning fuel at high temperatures, most notably in car engines and industrial boilers. It is a major component of urban smog.'
          },
          {
            id: '3.4.2',
            title: 'Respiratory Effects',
            content: 'Long-term exposure to NO2 can decrease lung function and increase the risk of respiratory infections and asthma, particularly in children.'
          }
        ]
      },
      {
        id: '3.5',
        title: 'Sulfur Dioxide (SO2)',
        topics: [
          {
            id: '3.5.1',
            title: 'Coal & Power Plants',
            content: 'SO2 is mainly emitted from the burning of fossil fuels containing sulfur, such as coal and oil in power plants and refineries. It has a sharp, pungent smell.'
          },
          {
            id: '3.5.2',
            title: 'Acid Rain Connection',
            content: 'SO2 can react with water and oxygen in the atmosphere to form sulfuric acid, the main component of acid rain, which damages ecosystems and heritage monuments like the Taj Mahal.'
          }
        ]
      },
      {
        id: '3.6',
        title: 'Ground-level Ozone (O3)',
        topics: [
          {
            id: '3.6.1',
            title: 'Secondary Formation',
            content: 'Ozone is not emitted directly. It forms when NOx and VOCs react in the presence of sunlight. This is why ozone levels are often highest during sunny afternoons.'
          },
          {
            id: '3.6.2',
            title: '"Good" vs "Bad" Ozone',
            content: 'Ozone in the upper atmosphere protects us from UV rays (Good), but ozone at ground level is a powerful irritant that triggers asthma and reduces crop yields (Bad).'
          }
        ]
      },
      {
        id: '3.7',
        title: 'Ammonia (NH3)',
        topics: [
          {
            id: '3.7.1',
            title: 'Agriculture & Waste',
            content: 'NH3 comes largely from agricultural activities like fertilizer application and livestock waste. It plays a key role in the formation of secondary particulate matter.'
          }
        ]
      },
      {
        id: '3.8',
        title: 'Lead (Pb)',
        topics: [
          {
            id: '3.8.1',
            title: 'Toxicity & Contamination',
            content: 'Lead is a heavy metal that can be found in industrial emissions and old pipes. It is highly toxic and can accumulate in the body, leading to neurological damage, especially in developing children.'
          }
        ]
      },
      {
        id: '3.9',
        title: 'VOCs',
        topics: [
          {
            id: '3.9.1',
            title: 'Indoor Chemicals',
            content: 'Volatile Organic Compounds are emitted as gases from certain solids or liquids, such as paints, cleaning supplies, pesticides, and building materials.'
          }
        ]
      },
      {
        id: '3.10',
        title: 'Black Carbon',
        topics: [
          {
            id: '3.10.1',
            title: 'Climate & Glaciers',
            content: 'Black carbon is a component of PM2.5 that strongly absorbs solar energy, warming the atmosphere. When it falls on snow or glaciers, it accelerates melting by making the surface darker.'
          }
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'SOURCES OF POLLUTION',
    description: 'Understand where the smog comes from—from the tailpipes of cars to the burning of stubble.',
    icon: 'factory',
    color: '#8B5CF6', // Purple
    subCategories: [
      {
        id: '4.1',
        title: 'Vehicular Pollution',
        topics: [
          {
            id: '4.1.1',
            title: 'Traffic & Emissions',
            content: 'Vehicles are the single largest source of urban air pollution. Cars, trucks, and buses emit a cocktail of PM2.5, NO2, and CO directly at street level where we breathe.'
          },
          {
            id: '4.1.2',
            title: 'Diesel vs Petrol',
            content: 'Diesel engines are major sources of particulate matter and black carbon, while petrol engines tend to emit more CO and NOx. Old, poorly maintained vehicles are significantly more polluting.'
          }
        ]
      },
      {
        id: '4.2',
        title: 'Construction & Dust',
        topics: [
          {
            id: '4.2.1',
            title: 'Urban Expansion',
            content: 'Demolition, excavation, and the transport of sand and cement create massive amounts of "fugitive dust" (PM10), which can travel long distances on the wind.'
          }
        ]
      },
      {
        id: '4.3',
        title: 'Industrial Pollution',
        topics: [
          {
            id: '4.3.1',
            title: 'Factories & Refineries',
            content: 'Large-scale manufacturing and thermal power plants burn coal and oil, releasing SO2, NOx, and heavy metals into the atmosphere.'
          }
        ]
      },
      {
        id: '4.4',
        title: 'Household Pollution',
        topics: [
          {
            id: '4.4.1',
            title: 'Indoor Sources',
            content: 'Cooking with biomass (wood, coal) is a major killer in rural areas. In cities, incense sticks, mosquito coils, and cleaning chemicals contribute significantly to poor indoor air quality.'
          }
        ]
      },
      {
        id: '4.5',
        title: 'Waste Burning',
        topics: [
          {
            id: '4.5.1',
            title: 'Garbage & Plastic',
            content: 'Open burning of municipal waste and plastics releases highly toxic dioxins and furans, which are carcinogenic even in small amounts.'
          }
        ]
      },
      {
        id: '4.6',
        title: 'Agricultural Sources',
        topics: [
          {
            id: '4.6.1',
            title: 'Stubble Burning',
            content: 'The seasonal burning of crop residues (parali) in Northern India creates a massive smoke cloud that impacts the air quality of the entire Indo-Gangetic plain.'
          }
        ]
      },
      {
        id: '4.7',
        title: 'Natural Sources',
        topics: [
          {
            id: '4.7.1',
            title: 'Nature\'s Contribution',
            content: 'Dust storms from deserts, forest fires, and even pollen can cause AQI to spike, proving that not all pollution is man-made.'
          }
        ]
      },
      {
        id: '4.8',
        title: 'Seasonal Pollution',
        topics: [
          {
            id: '4.8.1',
            title: 'Winter Inversion',
            content: 'In winter, cold air gets trapped near the ground under a layer of warm air. This "inversion" acts like a lid, trapping all urban pollution and causing hazardous smog.'
          }
        ]
      }
    ]
  },
  {
    id: '5',
    title: 'HEALTH IMPACTS',
    description: 'Explore the "silent killer" effect of pollution on your heart, lungs, brain, and the health of your children.',
    icon: 'favorite',
    color: '#EF4444', // Red/Rose
    subCategories: [
      {
        id: '5.1',
        title: 'Respiratory Diseases',
        topics: [
          {
            id: '5.1.1',
            title: 'Asthma & COPD',
            content: 'Air pollution is a major trigger for asthma attacks and a leading cause of Chronic Obstructive Pulmonary Disease (COPD). It causes constant inflammation in the airways, making it harder to breathe.'
          },
          {
            id: '5.1.2',
            title: 'Lung Cancer',
            content: 'The International Agency for Research on Cancer (IARC) has classified outdoor air pollution as a Group 1 carcinogen, meaning there is strong evidence that it causes lung cancer.'
          }
        ]
      },
      {
        id: '5.2',
        title: 'Cardiovascular Effects',
        topics: [
          {
            id: '5.2.1',
            title: 'Heart & Stroke',
            content: 'Fine particles (PM2.5) can enter the bloodstream and trigger systemic inflammation, leading to heart attacks, strokes, and hypertension (high blood pressure).'
          }
        ]
      },
      {
        id: '5.3',
        title: 'Neurological Effects',
        topics: [
          {
            id: '5.3.1',
            title: 'The Brain Connection',
            content: 'Emerging research shows that pollution is linked to cognitive decline, memory issues, and even an increased risk of Alzheimer\'s and Parkinson\'s disease later in life.'
          }
        ]
      },
      {
        id: '5.4',
        title: 'Impact on Children',
        topics: [
          {
            id: '5.4.1',
            title: 'Developing Lungs',
            content: 'Children are highly vulnerable because their lungs and immune systems are still developing. Exposure to heavy pollution can lead to permanently reduced lung capacity and stunted growth.'
          }
        ]
      },
      {
        id: '5.5',
        title: 'Pregnancy & Birth',
        topics: [
          {
            id: '5.5.1',
            title: 'Prenatal Risks',
            content: 'Mothers exposed to high pollution levels have a higher risk of low birth weight and premature births, which can have lifelong health consequences for the child.'
          }
        ]
      },
      {
        id: '5.6',
        title: 'Elderly Vulnerability',
        topics: [
          {
            id: '5.6.1',
            title: 'Chronic Risks',
            content: 'The elderly often have pre-existing heart or lung conditions, making them more likely to suffer from acute respiratory infections and cardiac events during high-pollution days.'
          }
        ]
      },
      {
        id: '5.7',
        title: 'Eye & Skin Effects',
        topics: [
          {
            id: '5.7.1',
            title: 'Irritation & Allergies',
            content: 'Gaseous pollutants like Ozone and NO2 cause burning sensations in the eyes, redness, and can aggravate skin conditions like eczema and premature skin aging.'
          }
        ]
      },
      {
        id: '5.8',
        title: 'Mental Health',
        topics: [
          {
            id: '5.8.1',
            title: 'Pollution Depression',
            content: 'Recent studies have found a strong correlation between long-term exposure to air pollution and increased rates of anxiety, stress, and depression.'
          }
        ]
      }
    ]
  },
  {
    id: '6',
    title: 'MITIGATION STRATEGIES',
    description: 'Learn how to protect yourself and your family, and discover how cities are fighting back against pollution.',
    icon: 'shield',
    color: '#0D9488', // Teal
    subCategories: [
      {
        id: '6.1',
        title: 'Personal Protection',
        topics: [
          {
            id: '6.1.1',
            title: 'N95 & Air Purifiers',
            content: 'N95 masks are the gold standard for personal protection, filtering out 95% of fine particles. Indoors, high-quality air purifiers with HEPA filters can reduce PM2.5 levels by up to 90%.'
          },
          {
            id: '6.1.2',
            title: 'AQI-based Planning',
            content: 'Check the AQI before heading out. If the levels are "Poor" or worse, avoid peak traffic hours and high-intensity outdoor workouts.'
          }
        ]
      },
      {
        id: '6.2',
        title: 'Household Mitigation',
        topics: [
          {
            id: '6.2.1',
            title: 'Indoor Plants & Ventilation',
            content: 'While plants like Sansevieria can improve indoor air, the most effective strategy is managing ventilation—keep windows closed during peak pollution hours and use wet mopping to keep dust down.'
          }
        ]
      },
      {
        id: '6.3',
        title: 'Community Actions',
        topics: [
          {
            id: '6.3.1',
            title: 'Carpooling & Public Transport',
            content: 'Reducing the number of private vehicles on the road is the fastest way to clear urban air. Using public transport or carpooling significantly reduces your personal carbon and pollution footprint.'
          }
        ]
      },
      {
        id: '6.4',
        title: 'Government Policies',
        topics: [
          {
            id: '6.4.1',
            title: 'NCAP & GRAP',
            content: 'The National Clean Air Programme (NCAP) and Graded Response Action Plan (GRAP) are India\'s frameworks for systematically reducing pollution through emergency measures like stopping construction during severe days.'
          },
          {
            id: '6.4.2',
            title: 'EV Policies',
            content: 'The transition to Electric Vehicles (EVs) is a critical government strategy to eliminate tailpipe emissions from our city streets.'
          }
        ]
      },
      {
        id: '6.5',
        title: 'Industrial & Construction',
        topics: [
          {
            id: '6.5.1',
            title: 'Dust Control',
            content: 'Modern construction sites must use dust nets, water spraying, and covered trucks to prevent particulate matter from becoming airborne and impacting nearby residents.'
          }
        ]
      },
      {
        id: '6.6',
        title: 'Smart City Solutions',
        topics: [
          {
            id: '6.6.1',
            title: 'AI & IoT',
            content: 'Smart cities use networks of IoT sensors and AI to predict pollution "hotspots," allowing for real-time traffic optimization and early warning systems for the public.'
          }
        ]
      }
    ]
  },
  {
    id: '8',
    title: 'SAFAR & IITM SCIENCE',
    description: 'Go behind the scenes of India\'s most advanced forecasting system developed by IITM Pune.',
    icon: 'science',
    color: '#1E3A8A', // Navy Blue
    subCategories: [
      {
        id: '8.1',
        title: 'What is SAFAR?',
        topics: [
          {
            id: '8.1.1',
            title: 'System Overview',
            content: 'SAFAR (System of Air Quality and Weather Forecasting And Research) is a national initiative introduced by the Ministry of Earth Sciences to provide location-specific information on air quality in near real-time.'
          },
          {
            id: '8.1.2',
            title: 'The Role of IITM',
            content: 'The Indian Institute of Tropical Meteorology (IITM), Pune, is the lead institution that designed and developed the SAFAR system, using advanced numerical models to predict pollution levels.'
          }
        ]
      },
      {
        id: '8.2',
        title: 'How SAFAR Works',
        topics: [
          {
            id: '8.2.1',
            title: 'Forecast Models',
            content: 'SAFAR uses the WRF-Chem (Weather Research and Forecasting with Chemistry) model to simulate how pollutants move and react in the atmosphere based on wind, temperature, and emission data.'
          },
          {
            id: '8.2.2',
            title: 'Data Assimilation',
            content: 'The system combines real-time data from a network of monitoring stations with satellite observations to ensure the forecast stays as accurate as possible.'
          }
        ]
      },
      {
        id: '8.3',
        title: 'SAFAR Forecast Features',
        topics: [
          {
            id: '8.3.1',
            title: '72-Hour Predictions',
            content: 'One of SAFAR\'s most powerful features is its ability to provide 1-day to 3-day advance forecasts for AQI, allowing city authorities and the public to prepare for smog events.'
          },
          {
            id: '8.3.2',
            title: 'Health Advisories',
            content: 'Based on the forecast, SAFAR issues specialized health advisories for different groups, such as people with heart disease, children, and the elderly.'
          }
        ]
      },
      {
        id: '8.4',
        title: 'IITM Research Topics',
        topics: [
          {
            id: '8.4.1',
            title: 'Aerosol Science',
            content: 'IITM scientists study how aerosols (tiny particles) interact with clouds and monsoon patterns, which is critical for understanding India\'s long-term climate future.'
          }
        ]
      }
    ]
  },
  {
    id: '9',
    title: 'POLICIES & REGULATIONS',
    description: 'Learn about the laws, programs, and standards that govern the air we breathe in India.',
    icon: 'gavel',
    color: '#D97706', // Amber/Gold
    subCategories: [
      {
        id: '9.1',
        title: 'Air Act 1981',
        topics: [
          {
            id: '9.1.1',
            title: 'Key Provisions',
            content: 'The Air (Prevention and Control of Pollution) Act, 1981 was the first major legislation in India aimed at preventing, controlling, and abating air pollution.'
          },
          {
            id: '9.1.2',
            title: 'Enforcement',
            content: 'The Act gives boards the power to inspect any control equipment, industrial plant, or manufacturing process and to take samples of air or emissions for analysis.'
          }
        ]
      },
      {
        id: '9.2',
        title: 'National Clean Air Programme',
        topics: [
          {
            id: '9.2.1',
            title: 'The Goals of NCAP',
            content: 'Launched in 2019, NCAP aims to reduce PM2.5 and PM10 concentrations by 20% to 30% by 2024 (compared to 2017 levels) in 122 "non-attainment" cities.'
          },
          {
            id: '9.2.2',
            title: 'Non-attainment Cities',
            content: 'These are cities that have consistently failed to meet National Ambient Air Quality Standards (NAAQS) for five consecutive years.'
          }
        ]
      },
      {
        id: '9.3',
        title: 'Bharat Stage Norms (BS-VI)',
        topics: [
          {
            id: '9.3.1',
            title: 'The Leap to BS-VI',
            content: 'In 2020, India skipped BS-V and moved directly to BS-VI standards, which significantly reduced sulfur content in fuel and tightened NOx and particulate limits for all new vehicles.'
          }
        ]
      },
      {
        id: '9.4',
        title: 'GRAP: Emergency Actions',
        topics: [
          {
            id: '9.4.1',
            title: 'Graded Response Plan',
            content: 'GRAP is a set of emergency measures that kick in when air quality deteriorates beyond a certain threshold. Actions include stopping construction, banning diesel generators, and even odd-even car rules.'
          }
        ]
      },
      {
        id: '9.5',
        title: 'CPCB & State Boards',
        topics: [
          {
            id: '9.5.1',
            title: 'The Role of CPCB',
            content: 'The Central Pollution Control Board (CPCB) sets the national standards and coordinates activities across state boards like the Maharashtra Pollution Control Board (MPCB).'
          }
        ]
      }
    ]
  },
  {
    id: '10',
    title: 'PUNE AIR INSIGHTS',
    description: 'A localized deep dive into the air quality challenges and solutions in our own city—Pune.',
    icon: 'location-city',
    color: '#F97316', // Orange
    subCategories: [
      {
        id: '10.1',
        title: 'Pune Pollution Sources',
        topics: [
          {
            id: '10.1.1',
            title: 'Metro & Real Estate',
            content: 'Pune\'s rapid expansion, including the massive Metro rail project and high-rise real estate growth, has led to significant dust (PM10) pollution across key corridors like Karve Road and Hinjawadi.'
          },
          {
            id: '10.1.2',
            title: 'The Industrial Belts',
            content: 'The industrial clusters in Pimpri-Chinchwad (PCMC) and Hadapsar contribute to NO2 and SO2 levels, especially during night-time emissions.'
          }
        ]
      },
      {
        id: '10.2',
        title: 'Area-wise AQI Hotspots',
        topics: [
          {
            id: '10.2.1',
            title: 'Shivajinagar & Hadapsar',
            content: 'Shivajinagar is often a hotspot due to extremely high traffic density, while Hadapsar sees spikes from both traffic and nearby industrial activity.'
          },
          {
            id: '10.2.2',
            title: 'Pashan: The Cleaner Pocket',
            content: 'Due to higher green cover and proximity to the hills, Pashan often records relatively better AQI than the city center, though winter inversions still impact it.'
          }
        ]
      },
      {
        id: '10.3',
        title: 'Seasonal Trends in Pune',
        topics: [
          {
            id: '10.3.1',
            title: 'Pune Winter Spikes',
            content: 'During December and January, Pune experiences "calm wind" conditions where pollutants from vehicles and construction don\'t disperse, leading to the city\'s highest AQI levels of the year.'
          }
        ]
      },
      {
        id: '10.4',
        title: 'Citizen Action',
        topics: [
          {
            id: '10.4.1',
            title: 'Waste Burning Complaints',
            content: 'Citizens can report illegal garbage burning—a major source of toxic smoke in suburban Pune—through the PMC Care portal or the "Mazi Vasundhara" initiative apps.'
          }
        ]
      },
      {
        id: '10.5',
        title: 'Clean Air Initiatives',
        topics: [
          {
            id: '10.5.1',
            title: 'PMC & Smart City',
            content: 'Pune Municipal Corporation (PMC) is implementing "Green Corridors" and increasing the PMPML electric bus fleet to reduce the city\'s overall transport emissions.'
          }
        ]
      }
    ]
  },
  {
    id: '12',
    title: 'INTERACTIVE LEARNING',
    description: 'Games, quizzes, and myth-busting to make air quality science fun and easy to understand.',
    icon: 'school',
    color: '#84CC16', // Lime Green
    subCategories: [
      {
        id: '12.1',
        title: 'Myth vs Fact',
        topics: [
          {
            id: '12.1.1',
            title: 'Does rain solve everything?',
            content: 'Myth: "Rain washes away all pollution forever." Fact: Rain does clear the air temporarily by settling particulate matter, but gaseous pollutants (like NO2) can remain, and PM levels often bounce back as soon as the ground dries.'
          },
          {
            id: '12.1.2',
            title: 'Can any mask work?',
            content: 'Myth: "A surgical mask or handkerchief is enough for pollution." Fact: Surgical masks are designed to stop droplets, not fine particles. Only N95 or N99 rated masks can effectively filter out PM2.5.'
          }
        ]
      },
      {
        id: '12.2',
        title: 'School Projects',
        topics: [
          {
            id: '12.2.1',
            title: 'The Dust Collector',
            content: 'A simple science project: Place white cards coated with petroleum jelly in different parts of your house/school for 24 hours. The amount of grey "soot" collected shows the relative dust levels in each area.'
          }
        ]
      },
      {
        id: '12.3',
        title: 'Interactive Tools',
        topics: [
          {
            id: '12.3.1',
            title: 'The AQI Quiz',
            content: 'Coming Soon: Test your knowledge with our AirSaathi Quiz to earn badges and become a certified Clean Air Ambassador!'
          }
        ]
      }
    ]
  },
  {
    id: '16',
    title: 'SPECIAL EVENTS',
    description: 'Understand how festivals, seasons, and accidental events cause massive temporary spikes in AQI.',
    icon: 'event',
    color: '#D946EF', // Magenta
    subCategories: [
      {
        id: '16.1',
        title: 'Festivals & Pollution',
        topics: [
          {
            id: '16.1.1',
            title: 'The Diwali Spike',
            content: 'Firecrackers release a massive amount of PM2.5, heavy metals, and sulfur in a very short period. Combined with winter weather, this creates a "smog cloud" that can linger for days.'
          },
          {
            id: '16.1.2',
            title: 'Holi Bonfires',
            content: 'The traditional "Holika Dahan" involves burning wood and biomass. On a city scale, thousands of simultaneous bonfires cause a localized but intense spike in carbon and particulate matter.'
          }
        ]
      },
      {
        id: '16.2',
        title: 'Accidental Events',
        topics: [
          {
            id: '16.2.1',
            title: 'Landfill & Scrap Fires',
            content: 'Accidental fires in garbage dumps or scrap yards release highly toxic chemical smoke. If you see such an event, stay indoors and keep windows tightly shut.'
          }
        ]
      }
    ]
  },
  {
    id: '17',
    title: 'ADVANCED SCIENCE',
    description: 'Deep dive into the high-level scientific methods used to study and model our atmosphere.',
    icon: 'biotech',
    color: '#475569', // Steel Blue/Slate
    subCategories: [
      {
        id: '17.1',
        title: 'Aerosol Science',
        topics: [
          {
            id: '17.1.1',
            title: 'Particle Interaction',
            content: 'Aerosols are tiny liquid or solid particles suspended in the air. Scientists study how they scatter light and interact with cloud droplets, which affects both visibility and rainfall.'
          }
        ]
      },
      {
        id: '17.2',
        title: 'Satellite Mapping',
        topics: [
          {
            id: '17.2.1',
            title: 'Views from Space',
            content: 'Satellites like Copernicus Sentinel-5P allow us to see NO2 and SO2 clouds from space, providing data for areas where ground sensors are missing.'
          }
        ]
      },
      {
        id: '17.3',
        title: 'Emission Inventories',
        topics: [
          {
            id: '17.3.1',
            title: 'Tracking the Sources',
            content: 'An emission inventory is a database that lists the amount of pollutants discharged into the atmosphere by every possible source in a specific geographic area.'
          }
        ]
      }
    ]
  }
];
