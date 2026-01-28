import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useRef } from "react";

const Documentation = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'Women_Safety_Application_Documentation.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(contentRef.current).save();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Project Documentation
          </h1>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div ref={contentRef} className="bg-white text-black p-8 rounded-lg shadow-lg space-y-8" style={{ fontSize: '12px', lineHeight: '1.6' }}>
          {/* Title Page */}
          <div className="text-center border-b-2 border-gray-300 pb-8 mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">WOMEN SAFETY APPLICATION</h1>
            <h2 className="text-xl text-gray-600 mb-2">AI-Powered Emergency Response Platform</h2>
            <p className="text-gray-500">Project Documentation & Technical Report</p>
          </div>

          {/* Table of Contents */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">TABLE OF CONTENTS</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Problem Definition</li>
              <li>Abstract</li>
              <li>Existing System</li>
              <li>Proposed System</li>
              <li>Module Description</li>
              <li>System Study and Design</li>
              <li>Database Design</li>
              <li>Module Implementation</li>
              <li>System Testing</li>
              <li>Data Flow Diagrams</li>
              <li>Conclusion</li>
            </ol>
          </section>

          {/* 1. Problem Definition */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">1. PROBLEM DEFINITION</h2>
            <p className="mb-4">
              Women face significant safety challenges in daily life, from commuting alone to navigating unfamiliar areas. 
              Current safety solutions suffer from several critical limitations:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Fragmented Tools:</strong> Emergency contacts, location sharing, and incident reporting exist as separate applications</li>
              <li><strong>Network Dependency:</strong> Most apps fail during network outages when help is needed most</li>
              <li><strong>Delayed Response:</strong> No community-based rapid response system exists</li>
              <li><strong>Limited Evidence Collection:</strong> No integrated mechanism to capture and preserve evidence during emergencies</li>
              <li><strong>Lack of Proactive Safety:</strong> Most systems are reactive rather than preventive</li>
            </ul>
            <div className="bg-gray-100 p-4 rounded mt-4">
              <p className="font-semibold">Core Challenge:</p>
              <p>How to create a unified, reliable, and community-driven safety platform that works even in adverse conditions?</p>
            </div>
          </section>

          {/* 2. Abstract */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">2. ABSTRACT</h2>
            <p className="mb-4">
              The Women Safety Application is a comprehensive, AI-powered emergency response platform designed to provide 
              real-time protection and community support for women. Built using modern web technologies including React 18, 
              TypeScript, and Supabase backend, the application offers a unified solution for personal safety.
            </p>
            <p className="mb-4">
              <strong>Key Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>One-tap SOS emergency alerts with automatic location sharing</li>
              <li>Shake detection and voice-activated emergency triggers</li>
              <li>Community volunteer network with proximity-based matching</li>
              <li>AI-powered safety analysis and risk assessment</li>
              <li>Real-time location tracking and journey monitoring</li>
              <li>Offline-capable evidence recording (audio, video, photos)</li>
              <li>Automated check-in system with missed check-in alerts</li>
            </ul>
            <p>
              The platform leverages PostgreSQL with Row-Level Security (RLS) for data protection, Edge Functions for 
              serverless computing, and real-time subscriptions for instant notifications.
            </p>
          </section>

          {/* 3. Existing System */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">3. EXISTING SYSTEM</h2>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Aspect</th>
                  <th className="border border-gray-300 p-2 text-left">Existing System Limitations</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Emergency Response</td>
                  <td className="border border-gray-300 p-2">Manual phone calls, SMS-based alerts with delays</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Location Sharing</td>
                  <td className="border border-gray-300 p-2">Separate apps required, not integrated with emergency systems</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Community Support</td>
                  <td className="border border-gray-300 p-2">No organized volunteer network or proximity matching</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Evidence Collection</td>
                  <td className="border border-gray-300 p-2">Manual recording, no automatic cloud backup</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Offline Support</td>
                  <td className="border border-gray-300 p-2">Most apps completely non-functional without internet</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">AI Integration</td>
                  <td className="border border-gray-300 p-2">No intelligent risk assessment or predictive analysis</td>
                </tr>
              </tbody>
            </table>
            <div className="bg-red-50 p-4 rounded mt-4 border-l-4 border-red-500">
              <p className="font-semibold text-red-700">Key Disadvantages:</p>
              <ul className="list-disc list-inside text-red-600 mt-2">
                <li>Fragmented user experience across multiple applications</li>
                <li>No real-time community response mechanism</li>
                <li>Complete failure during network outages</li>
                <li>Limited evidence preservation capabilities</li>
              </ul>
            </div>
          </section>

          {/* 4. Proposed System */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">4. PROPOSED SYSTEM</h2>
            <p className="mb-4">
              Our proposed Women Safety Application addresses all limitations of existing systems through a unified, 
              intelligent, and resilient platform.
            </p>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-green-50">
                  <th className="border border-gray-300 p-2 text-left">Feature</th>
                  <th className="border border-gray-300 p-2 text-left">Proposed Solution</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Unified Platform</td>
                  <td className="border border-gray-300 p-2">Single app for SOS, tracking, evidence, and community support</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Instant Activation</td>
                  <td className="border border-gray-300 p-2">One-tap SOS, shake detection, voice commands</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Community Network</td>
                  <td className="border border-gray-300 p-2">Verified volunteers with real-time proximity matching</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">AI Integration</td>
                  <td className="border border-gray-300 p-2">Safety analysis, risk assessment, intelligent recommendations</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Offline Resilience</td>
                  <td className="border border-gray-300 p-2">Local storage with automatic sync when online</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold">Evidence System</td>
                  <td className="border border-gray-300 p-2">Auto-record with secure cloud backup and timestamping</td>
                </tr>
              </tbody>
            </table>
            <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
              <p className="font-semibold text-green-700">Key Advantages:</p>
              <ul className="list-disc list-inside text-green-600 mt-2">
                <li>Comprehensive safety ecosystem in one application</li>
                <li>Sub-second emergency response activation</li>
                <li>Community-powered rapid assistance network</li>
                <li>Works offline with intelligent sync capabilities</li>
                <li>AI-enhanced safety intelligence and predictions</li>
              </ul>
            </div>
          </section>

          {/* 5. Module Description */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">5. MODULE DESCRIPTION</h2>
            
            <div className="space-y-6">
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.1 SOS Emergency Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Instant emergency alert activation with multiple trigger methods</p>
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>One-tap SOS button with countdown timer</li>
                  <li>Shake detection using device accelerometer</li>
                  <li>Voice activation with customizable trigger words</li>
                  <li>Automatic location capture and sharing</li>
                  <li>Silent mode for discreet emergencies</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.2 Volunteer Ecosystem Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Community-based rapid response network</p>
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Volunteer registration with verification</li>
                  <li>Real-time location tracking for available volunteers</li>
                  <li>Proximity-based matching using Haversine formula</li>
                  <li>Response time tracking and rating system</li>
                  <li>Admin dashboard for volunteer management</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.3 AI Safety Assistant Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Intelligent safety analysis and recommendations</p>
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Area safety scoring based on incident history</li>
                  <li>Route risk assessment for journeys</li>
                  <li>Personalized safety tips and recommendations</li>
                  <li>Natural language query processing</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.4 Evidence Recording Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Secure capture and preservation of evidence</p>
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Audio recording with background capture</li>
                  <li>Video recording with location metadata</li>
                  <li>Photo capture with timestamp and GPS</li>
                  <li>Automatic cloud backup and encryption</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.5 Check-In System Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Proactive safety monitoring through scheduled check-ins</p>
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Customizable check-in intervals</li>
                  <li>Automatic alerts on missed check-ins</li>
                  <li>Location capture at each check-in</li>
                  <li>Journey tracking with ETA monitoring</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.6 Live Location Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Real-time location sharing and tracking</p>
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Continuous GPS tracking</li>
                  <li>Location sharing with emergency contacts</li>
                  <li>Nearby safe places identification</li>
                  <li>Google Maps integration</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. System Study and Design */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">6. SYSTEM STUDY AND DESIGN</h2>
            
            <h3 className="font-bold text-lg mb-3">6.1 Technology Stack</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Layer</th>
                  <th className="border border-gray-300 p-2 text-left">Technology</th>
                  <th className="border border-gray-300 p-2 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Frontend Framework</td>
                  <td className="border border-gray-300 p-2">React 18</td>
                  <td className="border border-gray-300 p-2">Component-based UI development</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Language</td>
                  <td className="border border-gray-300 p-2">TypeScript</td>
                  <td className="border border-gray-300 p-2">Type safety and developer experience</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Styling</td>
                  <td className="border border-gray-300 p-2">Tailwind CSS</td>
                  <td className="border border-gray-300 p-2">Utility-first responsive design</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">UI Components</td>
                  <td className="border border-gray-300 p-2">shadcn/ui</td>
                  <td className="border border-gray-300 p-2">Accessible, customizable components</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">State Management</td>
                  <td className="border border-gray-300 p-2">TanStack Query</td>
                  <td className="border border-gray-300 p-2">Server state and caching</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Backend</td>
                  <td className="border border-gray-300 p-2">Supabase</td>
                  <td className="border border-gray-300 p-2">Database, Auth, Edge Functions</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Database</td>
                  <td className="border border-gray-300 p-2">PostgreSQL</td>
                  <td className="border border-gray-300 p-2">Relational data with RLS</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Maps</td>
                  <td className="border border-gray-300 p-2">Google Maps API</td>
                  <td className="border border-gray-300 p-2">Location services and mapping</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">AI</td>
                  <td className="border border-gray-300 p-2">Lovable AI Gateway</td>
                  <td className="border border-gray-300 p-2">Safety analysis and recommendations</td>
                </tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">6.2 System Architecture</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono">
              <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React)                     │
├─────────────────────────────────────────────────────────────┤
│  Components: SOS | Volunteer | Evidence | Check-In | Maps   │
│  Hooks: useGeolocation | useShakeDetection | useVoice       │
│  State: TanStack Query | React Context                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Supabase)                     │
├─────────────────────────────────────────────────────────────┤
│  REST API | Realtime Subscriptions | Edge Functions         │
│  Authentication | Row-Level Security                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (PostgreSQL)                │
├─────────────────────────────────────────────────────────────┤
│  Tables: incidents | volunteers | support_requests          │
│  RLS Policies | Triggers | Functions                        │
└─────────────────────────────────────────────────────────────┘
              `}</pre>
            </div>
          </section>

          {/* 7. Database Design */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">7. DATABASE DESIGN</h2>
            
            <h3 className="font-bold text-lg mb-3">7.1 Entity Relationship Overview</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4">
              <pre>{`
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   profiles   │────►│   incidents  │────►│     evidence     │
│   (users)    │     │  (emergency) │     │  (media files)   │
└──────────────┘     └──────────────┘     └──────────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────────┐
       │             │ support_requests │
       │             └──────────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────────┐
│  volunteers  │────►│ volunteer_alerts │
└──────────────┘     └──────────────────┘
       │
       ▼
┌──────────────────────┐
│ volunteer_locations  │
└──────────────────────┘
              `}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">7.2 Core Tables Schema</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-300 p-2" colSpan={4}>profiles (User Information)</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1">Column</th>
                    <th className="border border-gray-300 p-1">Type</th>
                    <th className="border border-gray-300 p-1">Constraints</th>
                    <th className="border border-gray-300 p-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-1">id</td><td className="border border-gray-300 p-1">UUID</td><td className="border border-gray-300 p-1">PK</td><td className="border border-gray-300 p-1">User ID from auth</td></tr>
                  <tr><td className="border border-gray-300 p-1">full_name</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">User's full name</td></tr>
                  <tr><td className="border border-gray-300 p-1">phone</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">Contact number</td></tr>
                  <tr><td className="border border-gray-300 p-1">blood_group</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">Medical info</td></tr>
                  <tr><td className="border border-gray-300 p-1">emergency_message</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">Custom SOS message</td></tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
                <thead>
                  <tr className="bg-red-50">
                    <th className="border border-gray-300 p-2" colSpan={4}>incidents (Emergency Events)</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1">Column</th>
                    <th className="border border-gray-300 p-1">Type</th>
                    <th className="border border-gray-300 p-1">Constraints</th>
                    <th className="border border-gray-300 p-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-1">id</td><td className="border border-gray-300 p-1">UUID</td><td className="border border-gray-300 p-1">PK</td><td className="border border-gray-300 p-1">Incident ID</td></tr>
                  <tr><td className="border border-gray-300 p-1">user_id</td><td className="border border-gray-300 p-1">UUID</td><td className="border border-gray-300 p-1">FK</td><td className="border border-gray-300 p-1">Reporter's ID</td></tr>
                  <tr><td className="border border-gray-300 p-1">incident_type</td><td className="border border-gray-300 p-1">ENUM</td><td className="border border-gray-300 p-1">NOT NULL</td><td className="border border-gray-300 p-1">sos, medical, fire, etc.</td></tr>
                  <tr><td className="border border-gray-300 p-1">status</td><td className="border border-gray-300 p-1">ENUM</td><td className="border border-gray-300 p-1">NOT NULL</td><td className="border border-gray-300 p-1">active, resolved, cancelled</td></tr>
                  <tr><td className="border border-gray-300 p-1">latitude</td><td className="border border-gray-300 p-1">FLOAT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">GPS latitude</td></tr>
                  <tr><td className="border border-gray-300 p-1">longitude</td><td className="border border-gray-300 p-1">FLOAT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">GPS longitude</td></tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-gray-300 p-2" colSpan={4}>volunteers (Community Responders)</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1">Column</th>
                    <th className="border border-gray-300 p-1">Type</th>
                    <th className="border border-gray-300 p-1">Constraints</th>
                    <th className="border border-gray-300 p-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-1">id</td><td className="border border-gray-300 p-1">UUID</td><td className="border border-gray-300 p-1">PK</td><td className="border border-gray-300 p-1">Volunteer ID</td></tr>
                  <tr><td className="border border-gray-300 p-1">user_id</td><td className="border border-gray-300 p-1">UUID</td><td className="border border-gray-300 p-1">FK, UNIQUE</td><td className="border border-gray-300 p-1">User reference</td></tr>
                  <tr><td className="border border-gray-300 p-1">full_name</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">NOT NULL</td><td className="border border-gray-300 p-1">Volunteer's name</td></tr>
                  <tr><td className="border border-gray-300 p-1">phone</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">NOT NULL</td><td className="border border-gray-300 p-1">Contact number</td></tr>
                  <tr><td className="border border-gray-300 p-1">is_available</td><td className="border border-gray-300 p-1">BOOLEAN</td><td className="border border-gray-300 p-1">DEFAULT true</td><td className="border border-gray-300 p-1">Availability status</td></tr>
                  <tr><td className="border border-gray-300 p-1">verified</td><td className="border border-gray-300 p-1">BOOLEAN</td><td className="border border-gray-300 p-1">DEFAULT false</td><td className="border border-gray-300 p-1">Verification status</td></tr>
                  <tr><td className="border border-gray-300 p-1">location_lat</td><td className="border border-gray-300 p-1">FLOAT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">Current latitude</td></tr>
                  <tr><td className="border border-gray-300 p-1">location_lng</td><td className="border border-gray-300 p-1">FLOAT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">Current longitude</td></tr>
                  <tr><td className="border border-gray-300 p-1">notification_radius_km</td><td className="border border-gray-300 p-1">INT</td><td className="border border-gray-300 p-1">DEFAULT 5</td><td className="border border-gray-300 p-1">Alert radius</td></tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-yellow-50">
                    <th className="border border-gray-300 p-2" colSpan={4}>support_requests (Help Requests)</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1">Column</th>
                    <th className="border border-gray-300 p-1">Type</th>
                    <th className="border border-gray-300 p-1">Constraints</th>
                    <th className="border border-gray-300 p-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-1">id</td><td className="border border-gray-300 p-1">UUID</td><td className="border border-gray-300 p-1">PK</td><td className="border border-gray-300 p-1">Request ID</td></tr>
                  <tr><td className="border border-gray-300 p-1">requester_id</td><td className="border border-gray-300 p-1">UUID</td><td className="border border-gray-300 p-1">FK</td><td className="border border-gray-300 p-1">User requesting help</td></tr>
                  <tr><td className="border border-gray-300 p-1">request_type</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">DEFAULT 'escort'</td><td className="border border-gray-300 p-1">Type of assistance</td></tr>
                  <tr><td className="border border-gray-300 p-1">urgency</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">DEFAULT 'medium'</td><td className="border border-gray-300 p-1">low, medium, high</td></tr>
                  <tr><td className="border border-gray-300 p-1">status</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">DEFAULT 'pending'</td><td className="border border-gray-300 p-1">pending, active, resolved</td></tr>
                  <tr><td className="border border-gray-300 p-1">latitude</td><td className="border border-gray-300 p-1">FLOAT</td><td className="border border-gray-300 p-1">NOT NULL</td><td className="border border-gray-300 p-1">Request location</td></tr>
                  <tr><td className="border border-gray-300 p-1">longitude</td><td className="border border-gray-300 p-1">FLOAT</td><td className="border border-gray-300 p-1">NOT NULL</td><td className="border border-gray-300 p-1">Request location</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 8. Module Implementation */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">8. MODULE IMPLEMENTATION</h2>
            
            <h3 className="font-bold text-lg mb-3">8.1 SOS Button Implementation</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`// SOSButton.tsx - Core emergency trigger
const handleSOSTrigger = async () => {
  setIsCountingDown(true);
  setCountdown(settings?.countdown_duration || 5);
  
  // Countdown timer
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        executeEmergency();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

const executeEmergency = async () => {
  // Capture location
  const position = await getCurrentPosition();
  
  // Create incident in database
  await supabase.from('incidents').insert({
    user_id: user.id,
    incident_type: 'sos',
    status: 'active',
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  });
  
  // Notify volunteers via Edge Function
  await supabase.functions.invoke('notify-volunteers', {
    body: { incidentId, latitude, longitude }
  });
};`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.2 Shake Detection Hook</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`// useShakeDetection.ts
const useShakeDetection = (onShake: () => void) => {
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity;
      const acceleration = Math.sqrt(x*x + y*y + z*z);
      
      if (acceleration > SHAKE_THRESHOLD) {
        shakeCount++;
        if (shakeCount >= REQUIRED_SHAKES) {
          onShake(); // Trigger SOS
          shakeCount = 0;
        }
      }
    };
    
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [onShake]);
};`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.3 Volunteer Proximity Matching</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`// notify-volunteers Edge Function
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find nearby volunteers
const nearbyVolunteers = volunteers.filter(v => {
  const distance = haversineDistance(
    incidentLat, incidentLng,
    v.location_lat, v.location_lng
  );
  return distance <= v.notification_radius_km;
});`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.4 Real-time Location Tracking</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono overflow-x-auto">
              <pre>{`// useGeolocation.ts
const useGeolocation = () => {
  const [position, setPosition] = useState(null);
  
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  
  return position;
};`}</pre>
            </div>
          </section>

          {/* 9. System Testing */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">9. SYSTEM TESTING</h2>
            
            <h3 className="font-bold text-lg mb-3">9.1 Testing Methodology</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Test Type</th>
                  <th className="border border-gray-300 p-2">Scope</th>
                  <th className="border border-gray-300 p-2">Tools</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Unit Testing</td>
                  <td className="border border-gray-300 p-2">Individual components and hooks</td>
                  <td className="border border-gray-300 p-2">Vitest, React Testing Library</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Integration Testing</td>
                  <td className="border border-gray-300 p-2">API interactions, database operations</td>
                  <td className="border border-gray-300 p-2">Supabase Test Helpers</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">E2E Testing</td>
                  <td className="border border-gray-300 p-2">Complete user flows</td>
                  <td className="border border-gray-300 p-2">Playwright, Cypress</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Security Testing</td>
                  <td className="border border-gray-300 p-2">RLS policies, authentication</td>
                  <td className="border border-gray-300 p-2">Supabase Security Linter</td>
                </tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">9.2 Test Cases</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">ID</th>
                  <th className="border border-gray-300 p-2">Test Case</th>
                  <th className="border border-gray-300 p-2">Steps</th>
                  <th className="border border-gray-300 p-2">Expected Result</th>
                  <th className="border border-gray-300 p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">TC001</td>
                  <td className="border border-gray-300 p-2">SOS Activation</td>
                  <td className="border border-gray-300 p-2">Press SOS button, wait for countdown</td>
                  <td className="border border-gray-300 p-2">Incident created, volunteers notified</td>
                  <td className="border border-gray-300 p-2 text-green-600">PASS</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">TC002</td>
                  <td className="border border-gray-300 p-2">SOS Cancellation</td>
                  <td className="border border-gray-300 p-2">Press SOS, then cancel during countdown</td>
                  <td className="border border-gray-300 p-2">No incident created</td>
                  <td className="border border-gray-300 p-2 text-green-600">PASS</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">TC003</td>
                  <td className="border border-gray-300 p-2">Volunteer Registration</td>
                  <td className="border border-gray-300 p-2">Fill form, submit registration</td>
                  <td className="border border-gray-300 p-2">Volunteer record created</td>
                  <td className="border border-gray-300 p-2 text-green-600">PASS</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">TC004</td>
                  <td className="border border-gray-300 p-2">Proximity Matching</td>
                  <td className="border border-gray-300 p-2">Create request with location</td>
                  <td className="border border-gray-300 p-2">Nearby volunteers receive alerts</td>
                  <td className="border border-gray-300 p-2 text-green-600">PASS</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">TC005</td>
                  <td className="border border-gray-300 p-2">Location Tracking</td>
                  <td className="border border-gray-300 p-2">Grant location permission</td>
                  <td className="border border-gray-300 p-2">Real-time coordinates displayed</td>
                  <td className="border border-gray-300 p-2 text-green-600">PASS</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">TC006</td>
                  <td className="border border-gray-300 p-2">RLS Policy - User Data</td>
                  <td className="border border-gray-300 p-2">Query another user's incidents</td>
                  <td className="border border-gray-300 p-2">Access denied, empty result</td>
                  <td className="border border-gray-300 p-2 text-green-600">PASS</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 10. Data Flow Diagrams */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">10. DATA FLOW DIAGRAMS</h2>
            
            <h3 className="font-bold text-lg mb-3">10.1 Context Diagram (Level 0)</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4">
              <pre>{`
                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐  ┌──────────────┐  ┌──────────┐
     │   SOS    │  │   Location   │  │ Evidence │
     │  Alert   │  │   Tracking   │  │ Capture  │
     └────┬─────┘  └──────┬───────┘  └────┬─────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │   WOMEN SAFETY      │
               │    APPLICATION      │
               └──────────┬──────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌──────────────┐ ┌──────────┐ ┌──────────────┐
   │  Volunteers  │ │   AI     │ │  Emergency   │
   │   Network    │ │ Analysis │ │  Contacts    │
   └──────────────┘ └──────────┘ └──────────────┘
              `}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">10.2 SOS Flow (Level 2)</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4">
              <pre>{`
┌──────┐    Trigger     ┌───────────┐
│ User │───────────────►│ SOS Button│
└──────┘                └─────┬─────┘
                              │
                        Start Countdown
                              │
                              ▼
                    ┌─────────────────┐    Cancel?   ┌──────────┐
                    │ Countdown Timer │─────────────►│   Stop   │
                    └────────┬────────┘              └──────────┘
                             │
                       Countdown = 0
                             │
                             ▼
               ┌─────────────────────────┐
               │   Get Current Location  │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │ Create Incident Record  │
               └────────────┬────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌──────────┐  ┌───────────┐  ┌───────────┐
       │  Notify  │  │  Notify   │  │  Start    │
       │Volunteers│  │ Contacts  │  │ Recording │
       └──────────┘  └───────────┘  └───────────┘
              `}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">10.3 Volunteer Notification Flow</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono">
              <pre>{`
┌──────────────┐         ┌─────────────────┐
│   Incident   │────────►│  Edge Function  │
│   Created    │         │notify-volunteers│
└──────────────┘         └────────┬────────┘
                                  │
                                  ▼
                      ┌───────────────────────┐
                      │  Query All Available  │
                      │     Volunteers        │
                      └───────────┬───────────┘
                                  │
                                  ▼
                      ┌───────────────────────┐
                      │  Calculate Distance   │
                      │  (Haversine Formula)  │
                      └───────────┬───────────┘
                                  │
                                  ▼
                      ┌───────────────────────┐
                      │ Filter by Radius      │
                      │ (notification_radius) │
                      └───────────┬───────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
    │ Create Alert  │    │ Create Alert  │    │ Create Alert  │
    │ Volunteer 1   │    │ Volunteer 2   │    │ Volunteer N   │
    └───────────────┘    └───────────────┘    └───────────────┘
              `}</pre>
            </div>
          </section>

          {/* 11. Conclusion */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">11. CONCLUSION</h2>
            <p className="mb-4">
              The Women Safety Application represents a comprehensive solution to the critical challenge of personal safety 
              for women. By integrating multiple safety features into a unified platform, the application provides:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Instant Emergency Response:</strong> Multiple activation methods ensure help is always accessible</li>
              <li><strong>Community-Powered Support:</strong> Volunteer network enables rapid local assistance</li>
              <li><strong>Intelligent Safety:</strong> AI-driven analysis provides proactive protection</li>
              <li><strong>Resilient Architecture:</strong> Offline capabilities ensure functionality in all conditions</li>
              <li><strong>Secure Data Handling:</strong> Row-Level Security protects sensitive information</li>
            </ul>
            <div className="bg-primary/10 p-4 rounded border-l-4 border-primary">
              <p className="font-semibold">Future Enhancements:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Integration with local emergency services (911/112)</li>
                <li>Wearable device support (smartwatches)</li>
                <li>Machine learning for predictive threat detection</li>
                <li>Multi-language support for broader accessibility</li>
                <li>Blockchain-based evidence verification</li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center border-t-2 border-gray-300 pt-6 mt-8">
            <p className="text-gray-500 text-sm">Women Safety Application - Project Documentation</p>
            <p className="text-gray-400 text-xs">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
