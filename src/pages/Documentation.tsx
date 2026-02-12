import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useRef } from "react";

const Documentation = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;
    window.print();
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

        <div ref={contentRef} className="bg-white text-black p-8 rounded-lg shadow-lg space-y-8 print:shadow-none" style={{ fontSize: '12px', lineHeight: '1.6' }}>
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
              TypeScript, and cloud backend services, the application offers a unified solution for personal safety.
            </p>
            <p className="mb-4"><strong>Key Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>One-tap SOS emergency alerts with automatic location sharing</li>
              <li>Shake detection and voice-activated emergency triggers</li>
              <li>Community volunteer network with proximity-based matching</li>
              <li>AI-powered safety analysis and risk assessment</li>
              <li>Real-time location tracking and journey monitoring with integrated maps</li>
              <li>Offline-capable evidence recording (audio, video, photos)</li>
              <li>Automated check-in system with 3-tier escalation (reminder → email → police)</li>
              <li>Journey tracking with start point, destination, mode of transport, and live location sharing</li>
              <li>WhatsApp-style live location sharing with expiry time</li>
              <li>Helper reward system with points, badges, and payment history</li>
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
                <tr><td className="border border-gray-300 p-2 font-semibold">Emergency Response</td><td className="border border-gray-300 p-2">Manual phone calls, SMS-based alerts with delays</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Location Sharing</td><td className="border border-gray-300 p-2">Separate apps required, not integrated with emergency systems</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Community Support</td><td className="border border-gray-300 p-2">No organized volunteer network or proximity matching</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Evidence Collection</td><td className="border border-gray-300 p-2">Manual recording, no automatic cloud backup</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Offline Support</td><td className="border border-gray-300 p-2">Most apps completely non-functional without internet</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">AI Integration</td><td className="border border-gray-300 p-2">No intelligent risk assessment or predictive analysis</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Journey Tracking</td><td className="border border-gray-300 p-2">No live location sharing with expiry, no mode of transport selection</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Check-In Escalation</td><td className="border border-gray-300 p-2">No multi-tier automated escalation with email and police alerts</td></tr>
              </tbody>
            </table>
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
                <tr><td className="border border-gray-300 p-2 font-semibold">Unified Platform</td><td className="border border-gray-300 p-2">Single app for SOS, tracking, evidence, and community support</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Instant Activation</td><td className="border border-gray-300 p-2">One-tap SOS, shake detection, voice commands</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Community Network</td><td className="border border-gray-300 p-2">Verified volunteers with real-time proximity matching and rewards</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">AI Integration</td><td className="border border-gray-300 p-2">Safety analysis, risk assessment, intelligent recommendations</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Journey Tracking</td><td className="border border-gray-300 p-2">Start/destination with transport mode, live location sharing with expiry</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">3-Tier Escalation</td><td className="border border-gray-300 p-2">Missed check-in: 1st=reminder, 2nd=email to contacts, 3rd=police + call</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Evidence System</td><td className="border border-gray-300 p-2">Auto-record with secure cloud backup and timestamping</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Helper Rewards</td><td className="border border-gray-300 p-2">Points, badges, levels (Bronze to Diamond), payment history</td></tr>
              </tbody>
            </table>
          </section>

          {/* 5. Module Description */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">5. MODULE DESCRIPTION</h2>
            
            <div className="space-y-6">
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.1 SOS Emergency Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Instant emergency alert activation with multiple trigger methods</p>
                <ul className="list-disc list-inside ml-4">
                  <li>One-tap SOS button with configurable countdown timer (3-10 seconds)</li>
                  <li>Shake detection using device accelerometer (3+ shakes trigger SOS)</li>
                  <li>Voice activation with customizable trigger words ("Help me", "Emergency")</li>
                  <li>Automatic GPS location capture and sharing via SMS</li>
                  <li>Silent mode for discreet emergencies</li>
                  <li>Auto-record audio/video on SOS trigger</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.2 Volunteer Ecosystem Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Community-based rapid response network with rewards</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Volunteer registration with identity verification</li>
                  <li>Real-time location tracking with configurable notification radius</li>
                  <li>Proximity-based matching using Haversine formula</li>
                  <li>OTP-based verification when helper arrives</li>
                  <li>Integrated Google Maps for real-time tracking (Uber-style)</li>
                  <li>Response time tracking, rating system, and reward points</li>
                  <li>5-tier leveling: Bronze → Silver → Gold → Platinum → Diamond</li>
                  <li>Badge system: First Helper, Fast Responder, Night Guardian, etc.</li>
                  <li>Session history with detailed earnings log</li>
                  <li>Location and radius settings (manual/auto)</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.3 Safety Check-In Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Proactive safety monitoring with 3-tier automated escalation</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Customizable check-in intervals (1 min to 2 hours)</li>
                  <li>Emergency contact selection for each session</li>
                  <li><strong>Escalation Level 1 (1 miss):</strong> Reminder toast notification</li>
                  <li><strong>Escalation Level 2 (2 misses):</strong> Automated emergency email with live GPS location and Google Maps link sent to selected emergency contacts via Resend API</li>
                  <li><strong>Escalation Level 3 (3+ misses):</strong> Email + police call (100) + live location broadcast</li>
                  <li>Conversational UI for late check-ins: "Are you okay?", "What happened?", with reason selection</li>
                  <li>Check-in history with status tracking (active/missed/alerted)</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.4 Journey Tracking Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Real-time journey monitoring with live location sharing</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Start point (auto-detected via GPS) and destination input</li>
                  <li>Mode of transport selection: Walking, Driving, Public Transport, Cycling</li>
                  <li>Estimated arrival time calculation</li>
                  <li>Live location sharing with emergency contacts (WhatsApp-style with expiry)</li>
                  <li>5-minute check-in reminders during journey</li>
                  <li>Missed check-in alerts sent to shared contacts</li>
                  <li>Journey history with route replay capability</li>
                  <li>Emergency contact email notification with trackable location link</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.5 AI Safety Assistant Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Intelligent safety analysis and recommendations</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Area safety scoring based on incident history</li>
                  <li>Route risk assessment for journeys</li>
                  <li>Personalized safety tips based on time and location</li>
                  <li>Natural language query processing via Gemini AI</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.6 Evidence Recording Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Secure capture and preservation of evidence</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Audio recording with background capture capability</li>
                  <li>Automatic cloud backup with encryption</li>
                  <li>GPS metadata stamped on every recording</li>
                  <li>Evidence library for playback and management</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.7 Live Location Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Real-time location sharing and tracking</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Continuous GPS tracking with high accuracy (maximumAge: 0)</li>
                  <li>Location sharing with emergency contacts via SMS/WhatsApp</li>
                  <li>Nearby safe places identification (police stations, hospitals)</li>
                  <li>Google Maps integration with incident heatmaps</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg text-primary mb-2">5.8 Emergency Email Notification Module</h3>
                <p className="mb-2"><strong>Purpose:</strong> Automated email alerts with location data</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Resend API integration for reliable email delivery</li>
                  <li>HTML-formatted emergency emails with Google Maps links</li>
                  <li>Automatic user profile and contact fetching</li>
                  <li>Escalation level indicated in email subject and body</li>
                  <li>Police notification flag for critical alerts</li>
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
                <tr><td className="border border-gray-300 p-2">Frontend Framework</td><td className="border border-gray-300 p-2">React 18</td><td className="border border-gray-300 p-2">Component-based UI development</td></tr>
                <tr><td className="border border-gray-300 p-2">Language</td><td className="border border-gray-300 p-2">TypeScript</td><td className="border border-gray-300 p-2">Type safety and developer experience</td></tr>
                <tr><td className="border border-gray-300 p-2">Styling</td><td className="border border-gray-300 p-2">Tailwind CSS</td><td className="border border-gray-300 p-2">Utility-first responsive design</td></tr>
                <tr><td className="border border-gray-300 p-2">UI Components</td><td className="border border-gray-300 p-2">shadcn/ui + Radix UI</td><td className="border border-gray-300 p-2">Accessible, customizable components</td></tr>
                <tr><td className="border border-gray-300 p-2">State Management</td><td className="border border-gray-300 p-2">TanStack Query + React Context</td><td className="border border-gray-300 p-2">Server state, caching, auth context</td></tr>
                <tr><td className="border border-gray-300 p-2">Backend</td><td className="border border-gray-300 p-2">Lovable Cloud (Supabase)</td><td className="border border-gray-300 p-2">Database, Auth, Edge Functions, Storage</td></tr>
                <tr><td className="border border-gray-300 p-2">Database</td><td className="border border-gray-300 p-2">PostgreSQL</td><td className="border border-gray-300 p-2">Relational data with Row-Level Security</td></tr>
                <tr><td className="border border-gray-300 p-2">Maps</td><td className="border border-gray-300 p-2">Google Maps JavaScript API</td><td className="border border-gray-300 p-2">Real-time location, directions, places</td></tr>
                <tr><td className="border border-gray-300 p-2">AI</td><td className="border border-gray-300 p-2">Lovable AI (Gemini)</td><td className="border border-gray-300 p-2">Safety analysis and recommendations</td></tr>
                <tr><td className="border border-gray-300 p-2">Email</td><td className="border border-gray-300 p-2">Resend API</td><td className="border border-gray-300 p-2">Automated emergency email notifications</td></tr>
                <tr><td className="border border-gray-300 p-2">Animations</td><td className="border border-gray-300 p-2">GSAP</td><td className="border border-gray-300 p-2">Smooth UI transitions</td></tr>
                <tr><td className="border border-gray-300 p-2">Build Tool</td><td className="border border-gray-300 p-2">Vite</td><td className="border border-gray-300 p-2">Fast dev server and optimized builds</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">6.2 System Architecture</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono">
              <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React 18)                  │
├─────────────────────────────────────────────────────────────┤
│  User Dashboard: SOS | Journey | Check-In | Evidence | Map  │
│  Helper Dashboard: Requests | Map | Rewards | History       │
│  Hooks: useGeolocation | useShakeDetection | useVoice       │
│  State: TanStack Query | React Context | sessionStorage     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Cloud)                        │
├─────────────────────────────────────────────────────────────┤
│  REST API | Realtime Subscriptions | Edge Functions         │
│  Authentication | Row-Level Security | Storage              │
│  Edge Functions: send-emergency-email | safety-analysis     │
│                  notify-volunteers | get-maps-key            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (PostgreSQL)                │
├─────────────────────────────────────────────────────────────┤
│  profiles | incidents | volunteers | support_requests       │
│  help_sessions | check_ins | journeys | journey_locations   │
│  emergency_contacts | evidence | volunteer_rewards          │
│  user_settings | user_roles | safety_analytics              │
│  RLS Policies | Triggers | Security Definer Functions       │
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
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  volunteers  │────►│ volunteer_alerts │     │  check_ins   │
└──────────────┘     └──────────────────┘     └──────────────┘
       │                                            │
       ▼                                            ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│ help_sessions    │  │ volunteer_rewards│  │   journeys   │
└──────────────────┘  └──────────────────┘  └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────────┐
                                            │journey_locations │
                                            └──────────────────┘
              `}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">7.2 Core Tables Schema</h3>
            <p className="text-sm mb-4">The database contains 18+ tables with comprehensive RLS policies. Key tables:</p>
            
            <div className="overflow-x-auto space-y-4">
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-blue-50"><th className="border border-gray-300 p-2" colSpan={4}>profiles (User Information)</th></tr>
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
                  <tr><td className="border border-gray-300 p-1">phone, blood_group, role</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">-</td><td className="border border-gray-300 p-1">Contact & medical info</td></tr>
                  <tr><td className="border border-gray-300 p-1">emergency_message</td><td className="border border-gray-300 p-1">TEXT</td><td className="border border-gray-300 p-1">DEFAULT</td><td className="border border-gray-300 p-1">Custom SOS message</td></tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-red-50"><th className="border border-gray-300 p-2" colSpan={4}>incidents + check_ins + journeys</th></tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1">Table</th>
                    <th className="border border-gray-300 p-1">Key Columns</th>
                    <th className="border border-gray-300 p-1">RLS</th>
                    <th className="border border-gray-300 p-1">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-1">incidents</td><td className="border border-gray-300 p-1">type, status, lat/lng</td><td className="border border-gray-300 p-1">user_id = auth.uid()</td><td className="border border-gray-300 p-1">SOS events</td></tr>
                  <tr><td className="border border-gray-300 p-1">check_ins</td><td className="border border-gray-300 p-1">status, next_due, notes</td><td className="border border-gray-300 p-1">user_id = auth.uid()</td><td className="border border-gray-300 p-1">Safety monitoring</td></tr>
                  <tr><td className="border border-gray-300 p-1">journeys</td><td className="border border-gray-300 p-1">destination, status, ETA</td><td className="border border-gray-300 p-1">user_id = auth.uid()</td><td className="border border-gray-300 p-1">Trip tracking</td></tr>
                  <tr><td className="border border-gray-300 p-1">journey_locations</td><td className="border border-gray-300 p-1">lat, lng, accuracy</td><td className="border border-gray-300 p-1">user_id = auth.uid()</td><td className="border border-gray-300 p-1">Location history</td></tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-green-50"><th className="border border-gray-300 p-2" colSpan={4}>Volunteer System Tables</th></tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1">Table</th>
                    <th className="border border-gray-300 p-1">Key Columns</th>
                    <th className="border border-gray-300 p-1">RLS</th>
                    <th className="border border-gray-300 p-1">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-1">volunteers</td><td className="border border-gray-300 p-1">name, available, rating, points</td><td className="border border-gray-300 p-1">user_id match</td><td className="border border-gray-300 p-1">Helper profiles</td></tr>
                  <tr><td className="border border-gray-300 p-1">help_sessions</td><td className="border border-gray-300 p-1">OTP, status, distance, rating</td><td className="border border-gray-300 p-1">participant match</td><td className="border border-gray-300 p-1">Active help sessions</td></tr>
                  <tr><td className="border border-gray-300 p-1">volunteer_rewards</td><td className="border border-gray-300 p-1">points, reason, session_id</td><td className="border border-gray-300 p-1">volunteer_id match</td><td className="border border-gray-300 p-1">Reward history</td></tr>
                  <tr><td className="border border-gray-300 p-1">volunteer_alerts</td><td className="border border-gray-300 p-1">status, response, distance</td><td className="border border-gray-300 p-1">volunteer_id match</td><td className="border border-gray-300 p-1">Alert notifications</td></tr>
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
  
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) { clearInterval(timer); executeEmergency(); return 0; }
      return prev - 1;
    });
  }, 1000);
};

const executeEmergency = async () => {
  const position = await getCurrentPosition();
  await supabase.from('incidents').insert({
    user_id: user.id, incident_type: 'sos', status: 'active',
    latitude: position.coords.latitude, longitude: position.coords.longitude
  });
  await supabase.functions.invoke('notify-volunteers', {
    body: { incidentId, latitude, longitude }
  });
};`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.2 Check-In Escalation System</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`// useCheckIn.ts - 3-tier escalation
const handleMissedCheckIn = async () => {
  const newMissedCount = missedCount + 1;
  
  if (newMissedCount === 1) {
    // Level 1: Reminder toast
    toast.warning('Are you okay? Please check in.');
  } else if (newMissedCount === 2) {
    // Level 2: Send emergency email via Edge Function
    await supabase.functions.invoke('send-emergency-email', {
      body: { user_id, latitude, longitude, missed_count }
    });
  } else if (newMissedCount >= 3) {
    // Level 3: Email + Police call + Live location
    await sendEmergencyEmail();
    window.location.href = 'tel:100'; // Call police
  }
};`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.3 Emergency Email Edge Function</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`// send-emergency-email/index.ts
// Fetches emergency contacts, user profile, and sends HTML email
// via Resend API with Google Maps location link
const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${RESEND_API_KEY}\` },
  body: JSON.stringify({
    from: "SafeHer Emergency <onboarding@resend.dev>",
    to: [contact.email],
    subject: "URGENT: User missed safety check-ins",
    html: emailHtml // Contains location, maps link, action items
  })
});`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.4 Journey Tracking with Live Location</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`// JourneyTracker.tsx - Full journey lifecycle
const startJourney = async () => {
  // Save to database with start/destination/transport mode
  await supabase.from('journeys').insert({
    user_id, start_latitude, start_longitude,
    destination_name, destination_lat, destination_lng,
    expected_arrival, status: 'active'
  });
  
  // Start GPS tracking with watchPosition
  navigator.geolocation.watchPosition((pos) => {
    recordLocation(journeyId, pos.coords.latitude, pos.coords.longitude);
  }, null, { enableHighAccuracy: true, maximumAge: 30000 });
  
  // Send notification email to selected contacts
  await supabase.functions.invoke('send-emergency-email', {
    body: { journey_started: true, destination, estimated_arrival }
  });
};`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.5 Volunteer Proximity Matching</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`// notify-volunteers Edge Function
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Filter volunteers within notification radius
const nearbyVolunteers = volunteers.filter(v => {
  const distance = haversineDistance(lat, lng, v.location_lat, v.location_lng);
  return distance <= v.notification_radius_km;
});`}</pre>
            </div>
          </section>

          {/* 9. System Testing */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">9. SYSTEM TESTING</h2>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Test Case</th>
                  <th className="border border-gray-300 p-2 text-left">Input</th>
                  <th className="border border-gray-300 p-2 text-left">Expected Output</th>
                  <th className="border border-gray-300 p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">SOS Button</td><td className="border border-gray-300 p-2">Long press 2s</td><td className="border border-gray-300 p-2">Countdown → Alert sent</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Shake Detection</td><td className="border border-gray-300 p-2">3+ shakes</td><td className="border border-gray-300 p-2">SOS triggered</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Check-In L1</td><td className="border border-gray-300 p-2">1 missed check-in</td><td className="border border-gray-300 p-2">Reminder toast shown</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Check-In L2</td><td className="border border-gray-300 p-2">2 missed check-ins</td><td className="border border-gray-300 p-2">Emergency email sent</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Check-In L3</td><td className="border border-gray-300 p-2">3 missed check-ins</td><td className="border border-gray-300 p-2">Police call + email</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Journey Start</td><td className="border border-gray-300 p-2">Destination + contacts</td><td className="border border-gray-300 p-2">Tracking begins, contacts notified</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Volunteer Accept</td><td className="border border-gray-300 p-2">Accept request</td><td className="border border-gray-300 p-2">Navigation + OTP shown</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">OTP Verification</td><td className="border border-gray-300 p-2">Enter 4-digit OTP</td><td className="border border-gray-300 p-2">Session marked verified</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Evidence Upload</td><td className="border border-gray-300 p-2">Audio recording</td><td className="border border-gray-300 p-2">Uploaded to cloud storage</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Role Isolation</td><td className="border border-gray-300 p-2">Two tabs, different roles</td><td className="border border-gray-300 p-2">Independent sessions</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Emergency Email</td><td className="border border-gray-300 p-2">Missed check-in trigger</td><td className="border border-gray-300 p-2">Email with location sent</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Reward Points</td><td className="border border-gray-300 p-2">Complete help session</td><td className="border border-gray-300 p-2">Points awarded, history logged</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
              </tbody>
            </table>
          </section>

          {/* 10. Data Flow Diagrams */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">10. DATA FLOW DIAGRAMS</h2>
            
            <h3 className="font-bold text-lg mb-3">10.1 Level 0 DFD (Context Diagram)</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4">
              <pre>{`
    ┌──────────┐                                    ┌──────────┐
    │   User   │─── SOS/Check-in/Journey ──►       │          │
    │ (Woman)  │◄── Alerts/Location/Status ──       │  SafeHer │
    └──────────┘                                    │  System  │
                                                    │          │
    ┌──────────┐                                    │          │
    │  Helper  │─── Accept/Navigate/OTP ───►        │          │
    │(Volunteer│◄── Alerts/Rewards/Session ──       │          │
    └──────────┘                                    └──────────┘
                                                         │
    ┌──────────┐                                         │
    │Emergency │◄── Email with Location ─────────────────┘
    │ Contact  │
    └──────────┘
              `}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">10.2 Level 1 DFD (SOS Flow)</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4">
              <pre>{`
User ─── Press SOS ───► [1.0 SOS Module] ──► Create Incident (DB)
                              │                       │
                              ▼                       ▼
                        Capture Location      [2.0 Notify Module]
                              │                       │
                              ▼                       ▼
                        Send SMS/Email     Alert Nearby Volunteers
                        to Contacts         (Edge Function)
              `}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">10.3 Level 1 DFD (Check-In Escalation)</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4">
              <pre>{`
User ─── Start Session ───► [Timer Countdown]
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              1 miss:         2 misses:      3+ misses:
              Toast           Email via       Email + Call
              Reminder        Resend API      Police (100)
                              to contacts     + Live Location
              `}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">10.4 Level 1 DFD (Volunteer Help Flow)</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4">
              <pre>{`
User Request ──► [Match Nearby Helpers] ──► Alert Sent
                                                │
                                                ▼
                                         Helper Accepts
                                                │
                                                ▼
                                    [Navigation + Tracking]
                                         (Google Maps)
                                                │
                                                ▼
                                       OTP Verification
                                                │
                                                ▼
                                      Session Complete
                                                │
                                                ▼
                                    Points + Rating Awarded
              `}</pre>
            </div>
          </section>

          {/* 11. Security */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">11. SECURITY IMPLEMENTATION</h2>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">Row-Level Security (RLS)</h3>
                <p className="text-sm">Every table has RLS enabled with policies ensuring users can only access their own data. Volunteers can view pending requests but cannot access other users' personal information.</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">Session Isolation</h3>
                <p className="text-sm">Authentication uses sessionStorage (not localStorage) to isolate sessions per browser tab, enabling simultaneous User and Helper logins on the same device.</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">Role-Based Access Control</h3>
                <p className="text-sm">RBAC implemented via user_roles table with security definer functions (has_role, get_user_role). Dashboards and navigation are strictly separated by role.</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">API Key Security</h3>
                <p className="text-sm">Google Maps API key stored as server-side secret, fetched via Edge Function. Resend API key secured in cloud secrets. No private keys exposed in client code.</p>
              </div>
            </div>
          </section>

          {/* 12. Conclusion */}
          <section>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4">12. CONCLUSION</h2>
            <p className="mb-4">
              The Women Safety Application successfully addresses the critical gaps in existing safety solutions by providing 
              a unified, intelligent, and community-driven platform. Key achievements include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Comprehensive Safety Ecosystem:</strong> SOS, check-ins, journey tracking, evidence recording, and AI analysis in one platform</li>
              <li><strong>3-Tier Automated Escalation:</strong> Progressive response from reminder → email notification → police alert with live location</li>
              <li><strong>Community Volunteer Network:</strong> Real-time proximity matching with OTP verification, integrated map tracking, and gamified reward system</li>
              <li><strong>Real-Time Tracking:</strong> Google Maps-integrated live location sharing for both journey tracking and helper navigation</li>
              <li><strong>Role-Based Architecture:</strong> Clean separation between User and Helper experiences with isolated sessions</li>
              <li><strong>Automated Emergency Emails:</strong> Resend API integration delivering location-enriched alerts to emergency contacts</li>
              <li><strong>Production-Ready Security:</strong> RLS policies, RBAC, encrypted secrets, and session isolation</li>
            </ul>
            <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
              <p className="font-semibold text-green-700">Future Scope:</p>
              <ul className="list-disc list-inside text-green-600 mt-2">
                <li>Native mobile app with Capacitor for iOS/Android</li>
                <li>Predictive safety scoring using ML on historical incident data</li>
                <li>Integration with government emergency services APIs</li>
                <li>Multi-language support for broader accessibility</li>
                <li>Wearable device integration for hands-free SOS</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
