import { Button } from "@/components/ui/button";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const Documentation = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Project Documentation
            </h1>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div ref={contentRef} className="bg-white text-black p-8 rounded-lg shadow-lg space-y-8 print:shadow-none" style={{ fontSize: '12px', lineHeight: '1.6' }}>
          
          {/* Title Page */}
          <div className="text-center border-b-2 border-gray-300 pb-8 mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#dc2626' }}>WOMEN SAFETY APPLICATION</h1>
            <h2 className="text-xl text-gray-600 mb-2">SafeHer - AI-Powered Emergency Response Platform</h2>
            <p className="text-gray-500 mb-6">A Comprehensive Web Application for Women's Safety</p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Project Documentation & Technical Report</p>
              <p>Academic Year 2025-2026</p>
            </div>
          </div>

          {/* TABLE OF CONTENTS */}
          <section className="mb-8 page-break-after">
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>TABLE OF CONTENTS</h2>
            <div className="space-y-1 text-sm">
              {[
                { num: '1', title: 'Introduction' },
                { num: '2', title: 'Project Objective' },
                { num: '3', title: 'Background Study' },
                { num: '3.1', title: 'Organization Profile', indent: true },
                { num: '3.2', title: 'Study on Existing System', indent: true },
                { num: '4', title: 'Proposed System' },
                { num: '4.1', title: 'Defining the Problem (Modules)', indent: true },
                { num: '5', title: 'System Specification' },
                { num: '5.1', title: 'Software Specification', indent: true },
                { num: '5.2', title: 'Hardware Specification', indent: true },
                { num: '5.3', title: 'Application Specification', indent: true },
                { num: '6', title: 'System Design & Development' },
                { num: '6.1', title: 'Data Flow Diagram', indent: true },
                { num: '6.2', title: 'Entity Relationship Diagram', indent: true },
                { num: '6.3', title: 'Input Design', indent: true },
                { num: '6.4', title: 'Output Design', indent: true },
                { num: '6.5', title: 'Database Design', indent: true },
                { num: '7', title: 'System Testing' },
                { num: '7.1', title: 'Unit Testing', indent: true },
                { num: '7.2', title: 'Integration Testing', indent: true },
                { num: '7.3', title: 'System Testing', indent: true },
                { num: '7.4', title: 'Acceptance Testing', indent: true },
                { num: '7.5', title: 'Black Box Testing', indent: true },
                { num: '7.6', title: 'White Box Testing', indent: true },
                { num: '7.7', title: 'Validation Testing', indent: true },
                { num: '8', title: 'System Implementation and Maintenance' },
                { num: '9', title: 'Conclusion' },
                { num: '10', title: 'Future Enhancements' },
                { num: '11', title: 'Bibliography' },
                { num: '12', title: 'Appendix' },
                { num: 'A', title: 'Data Flow Diagram', indent: true },
                { num: 'B', title: 'Entity Relationship Diagram', indent: true },
                { num: 'C', title: 'Database Design', indent: true },
                { num: 'D', title: 'Sample Screen Shots', indent: true },
                { num: 'E', title: 'Source Code', indent: true },
              ].map((item) => (
                <div key={item.num} className={`flex items-center gap-2 ${item.indent ? 'ml-8' : 'font-semibold'}`}>
                  <span className="w-8 text-right">{item.num}.</span>
                  <span className="flex-1 border-b border-dotted border-gray-300">{item.title}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 1. INTRODUCTION */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>1. INTRODUCTION</h2>
            <p className="mb-4">
              Women's safety remains a pressing concern globally. Despite advancements in technology, women continue to face threats during daily activities such as commuting, traveling alone, or navigating unfamiliar areas. Traditional safety measures like carrying pepper spray or making phone calls during emergencies are often insufficient, especially when the victim is unable to physically interact with their device.
            </p>
            <p className="mb-4">
              The "SafeHer" Women Safety Application is a comprehensive, AI-powered emergency response platform designed to address these critical gaps. Built using modern web technologies, the application provides an integrated ecosystem combining instant emergency alerts, real-time location tracking, community-based volunteer support, automated escalation mechanisms, and evidence preservation — all within a single, accessible web application.
            </p>
            <p className="mb-4">
              The platform operates on a dual-role architecture: <strong>Users</strong> (women seeking safety features) and <strong>Helpers</strong> (community volunteers who respond to distress signals). This role-based system ensures that every stakeholder has a tailored experience optimized for their specific needs.
            </p>
            <p>
              Key innovations include a 3-tier automated escalation system for missed safety check-ins (reminder → emergency email → police alert), WhatsApp-style live location sharing with expiry for journey tracking, shake-and-voice-activated SOS triggers, and a gamified volunteer reward system that incentivizes community participation.
            </p>
          </section>

          {/* 2. PROJECT OBJECTIVE */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>2. PROJECT OBJECTIVE</h2>
            <p className="mb-4">The primary objectives of the SafeHer Women Safety Application are:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong>Instant Emergency Response:</strong> Enable one-tap SOS alerts with automatic GPS location capture and sharing with emergency contacts and nearby volunteers.</li>
              <li><strong>Proactive Safety Monitoring:</strong> Implement an automated check-in system with 3-tier escalation (reminder toast → emergency email with location → police call with live location broadcast).</li>
              <li><strong>Community-Based Support:</strong> Build a verified volunteer network with proximity-based matching, real-time navigation, OTP verification, and a gamified reward system.</li>
              <li><strong>Journey Safety:</strong> Provide real-time journey tracking with start/destination selection, transport mode, and automated live location sharing with emergency contacts (with expiry).</li>
              <li><strong>Evidence Preservation:</strong> Enable automatic audio/video recording during emergencies with secure cloud backup and GPS metadata.</li>
              <li><strong>AI-Powered Safety Analysis:</strong> Integrate AI models for area safety scoring, route risk assessment, and personalized safety recommendations.</li>
              <li><strong>Accessibility:</strong> Support multiple SOS trigger methods including button press, device shake detection, and voice activation with customizable trigger words.</li>
              <li><strong>Data Security:</strong> Implement Row-Level Security (RLS) on all database tables ensuring users can only access their own data, with role-based access control for User and Helper roles.</li>
            </ol>
          </section>

          {/* 3. BACKGROUND STUDY */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>3. BACKGROUND STUDY</h2>
            
            <h3 className="font-bold text-lg mb-3">3.1 Organization Profile</h3>
            <p className="mb-4">
              This project is developed as an academic final-year project aimed at creating a production-ready women's safety solution. The development follows Agile methodology with iterative feature delivery and continuous integration. The application is designed to serve urban and semi-urban women who commute regularly and seek a reliable safety companion on their devices.
            </p>

            <h3 className="font-bold text-lg mb-3">3.2 Study on Existing System</h3>
            <p className="mb-4">Current women safety applications in the market have several limitations:</p>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Existing Application</th>
                  <th className="border border-gray-300 p-2 text-left">Limitations</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">bSafe</td><td className="border border-gray-300 p-2">Limited to SOS and location sharing; no community volunteer system; no automated escalation</td></tr>
                <tr><td className="border border-gray-300 p-2">Shake2Safety</td><td className="border border-gray-300 p-2">Only SMS-based alerts; no real-time tracking; no evidence recording</td></tr>
                <tr><td className="border border-gray-300 p-2">My Safetipin</td><td className="border border-gray-300 p-2">Focuses on area safety audits only; no personal emergency features</td></tr>
                <tr><td className="border border-gray-300 p-2">Nirbhaya: Be Fearless</td><td className="border border-gray-300 p-2">Basic SOS with SMS; no check-in system; no volunteer matching</td></tr>
                <tr><td className="border border-gray-300 p-2">Women Safety App (Google Play)</td><td className="border border-gray-300 p-2">Fragmented features; no journey tracking with live location sharing; no AI integration</td></tr>
              </tbody>
            </table>
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold">Key Gaps Identified:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>No unified platform combining SOS, tracking, check-ins, evidence, and volunteer support</li>
                <li>No automated multi-tier escalation (reminder → email → police)</li>
                <li>No community-based real-time volunteer matching with proximity detection</li>
                <li>No WhatsApp-style live location sharing with expiry for journeys</li>
                <li>No AI-powered safety analysis and risk assessment</li>
                <li>No gamified reward system to incentivize community volunteers</li>
              </ul>
            </div>
          </section>

          {/* 4. PROPOSED SYSTEM */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>4. PROPOSED SYSTEM</h2>
            <p className="mb-4">
              The SafeHer Women Safety Application addresses all identified limitations through a unified, intelligent, and community-driven platform. The system is built on a modern web stack ensuring accessibility across all devices with a responsive design.
            </p>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-green-50">
                  <th className="border border-gray-300 p-2 text-left">Feature</th>
                  <th className="border border-gray-300 p-2 text-left">Proposed Solution</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2 font-semibold">Unified Platform</td><td className="border border-gray-300 p-2">Single web app for SOS, journey tracking, check-ins, evidence recording, volunteer support, and AI analysis</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Multi-Trigger SOS</td><td className="border border-gray-300 p-2">One-tap button, shake detection (3+ shakes), voice activation with customizable trigger words</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">3-Tier Escalation</td><td className="border border-gray-300 p-2">1st miss: reminder; 2nd miss: emergency email via Resend API; 3rd miss: police call + live location broadcast</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Journey Tracking</td><td className="border border-gray-300 p-2">Start/destination with transport mode, live location sharing with expiry, email notifications to contacts</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Volunteer Network</td><td className="border border-gray-300 p-2">Proximity matching (Haversine formula), real-time navigation, OTP verification, reward points and badges</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">AI Safety Analysis</td><td className="border border-gray-300 p-2">Area safety scoring, route risk assessment, personalized recommendations via Gemini AI</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Evidence System</td><td className="border border-gray-300 p-2">Auto-record audio/video, secure cloud backup with GPS metadata and timestamps</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Role-Based Architecture</td><td className="border border-gray-300 p-2">Separate User and Helper dashboards with isolated sessions and navigation</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">4.1 Defining the Problem (Modules)</h3>
            <div className="space-y-4">
              {[
                { name: 'M1: SOS Emergency Module', desc: 'One-tap SOS with 5-second countdown, shake detection (accelerometer), voice activation, GPS capture, SMS/email alerts to contacts, automatic audio recording, silent mode for discreet emergencies.' },
                { name: 'M2: Safety Check-In Module', desc: 'Configurable check-in intervals (1 min to 2 hours), emergency contact selection, 3-tier automated escalation (toast → email → police), conversational UI for late check-ins asking "What happened?" with reason selection, check-in history tracking.' },
                { name: 'M3: Journey Tracking Module', desc: 'GPS-based start point detection, destination input, transport mode selection (Walking/Driving/Public Transport/Cycling), estimated arrival time, live location sharing with emergency contacts (WhatsApp-style with expiry), email notifications on start/arrival/missed check-in.' },
                { name: 'M4: Volunteer Ecosystem Module', desc: 'Registration with verification, real-time proximity matching using Haversine formula, configurable notification radius, Google Maps navigation to requester, OTP verification on arrival, 5-tier leveling (Bronze→Diamond), badge system, session history, earnings log.' },
                { name: 'M5: Evidence Recording Module', desc: 'Audio recording with background capture, automatic cloud backup to secure storage, GPS metadata on every recording, evidence library for playback and management.' },
                { name: 'M6: AI Safety Assistant Module', desc: 'Area safety scoring based on incident history, route risk assessment, personalized safety tips, natural language query processing via Gemini AI model.' },
                { name: 'M7: Emergency Email Notification Module', desc: 'Resend API integration for reliable email delivery, HTML-formatted emails with Google Maps location links, automatic user profile and contact fetching, escalation level indicated in subject and body.' },
                { name: 'M8: Live Location & Maps Module', desc: 'Google Maps JavaScript API integration, real-time GPS tracking, nearby safe places (police stations, hospitals), incident heatmaps, helper navigation with directions.' },
              ].map((mod) => (
                <div key={mod.name} className="border rounded p-3">
                  <h4 className="font-bold text-sm mb-1" style={{ color: '#dc2626' }}>{mod.name}</h4>
                  <p className="text-sm">{mod.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. SYSTEM SPECIFICATION */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>5. SYSTEM SPECIFICATION</h2>
            
            <h3 className="font-bold text-lg mb-3">5.1 Software Specification</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Component</th>
                  <th className="border border-gray-300 p-2 text-left">Technology</th>
                  <th className="border border-gray-300 p-2 text-left">Version</th>
                  <th className="border border-gray-300 p-2 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">Frontend Framework</td><td className="border border-gray-300 p-2">React</td><td className="border border-gray-300 p-2">18.3</td><td className="border border-gray-300 p-2">Component-based UI development</td></tr>
                <tr><td className="border border-gray-300 p-2">Language</td><td className="border border-gray-300 p-2">TypeScript</td><td className="border border-gray-300 p-2">5.x</td><td className="border border-gray-300 p-2">Type safety and developer experience</td></tr>
                <tr><td className="border border-gray-300 p-2">CSS Framework</td><td className="border border-gray-300 p-2">Tailwind CSS</td><td className="border border-gray-300 p-2">3.x</td><td className="border border-gray-300 p-2">Utility-first responsive design</td></tr>
                <tr><td className="border border-gray-300 p-2">UI Components</td><td className="border border-gray-300 p-2">shadcn/ui + Radix UI</td><td className="border border-gray-300 p-2">Latest</td><td className="border border-gray-300 p-2">Accessible, customizable primitives</td></tr>
                <tr><td className="border border-gray-300 p-2">State Management</td><td className="border border-gray-300 p-2">TanStack Query + React Context</td><td className="border border-gray-300 p-2">5.x</td><td className="border border-gray-300 p-2">Server state caching, auth context</td></tr>
                <tr><td className="border border-gray-300 p-2">Backend</td><td className="border border-gray-300 p-2">Cloud Platform (PostgreSQL)</td><td className="border border-gray-300 p-2">15.x</td><td className="border border-gray-300 p-2">Database, Auth, Edge Functions, Storage</td></tr>
                <tr><td className="border border-gray-300 p-2">Maps API</td><td className="border border-gray-300 p-2">Google Maps JavaScript API</td><td className="border border-gray-300 p-2">v3</td><td className="border border-gray-300 p-2">Location, directions, places, geocoding</td></tr>
                <tr><td className="border border-gray-300 p-2">Email Service</td><td className="border border-gray-300 p-2">Resend API</td><td className="border border-gray-300 p-2">Latest</td><td className="border border-gray-300 p-2">Automated emergency email notifications</td></tr>
                <tr><td className="border border-gray-300 p-2">AI Model</td><td className="border border-gray-300 p-2">Gemini (Google AI)</td><td className="border border-gray-300 p-2">2.5</td><td className="border border-gray-300 p-2">Safety analysis and recommendations</td></tr>
                <tr><td className="border border-gray-300 p-2">Animations</td><td className="border border-gray-300 p-2">GSAP</td><td className="border border-gray-300 p-2">3.x</td><td className="border border-gray-300 p-2">Smooth UI transitions and effects</td></tr>
                <tr><td className="border border-gray-300 p-2">Build Tool</td><td className="border border-gray-300 p-2">Vite</td><td className="border border-gray-300 p-2">5.x</td><td className="border border-gray-300 p-2">Fast dev server and optimized production builds</td></tr>
                <tr><td className="border border-gray-300 p-2">Routing</td><td className="border border-gray-300 p-2">React Router DOM</td><td className="border border-gray-300 p-2">6.x</td><td className="border border-gray-300 p-2">Client-side routing with protected routes</td></tr>
                <tr><td className="border border-gray-300 p-2">Serverless Functions</td><td className="border border-gray-300 p-2">Deno Edge Functions</td><td className="border border-gray-300 p-2">Latest</td><td className="border border-gray-300 p-2">Backend logic (email, notifications, AI)</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">5.2 Hardware Specification</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Requirement</th>
                  <th className="border border-gray-300 p-2 text-left">Minimum</th>
                  <th className="border border-gray-300 p-2 text-left">Recommended</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">Processor</td><td className="border border-gray-300 p-2">Dual Core 1.5 GHz</td><td className="border border-gray-300 p-2">Quad Core 2.0+ GHz</td></tr>
                <tr><td className="border border-gray-300 p-2">RAM</td><td className="border border-gray-300 p-2">2 GB</td><td className="border border-gray-300 p-2">4 GB+</td></tr>
                <tr><td className="border border-gray-300 p-2">Storage</td><td className="border border-gray-300 p-2">100 MB (browser cache)</td><td className="border border-gray-300 p-2">500 MB+</td></tr>
                <tr><td className="border border-gray-300 p-2">Network</td><td className="border border-gray-300 p-2">3G connection</td><td className="border border-gray-300 p-2">4G/Wi-Fi</td></tr>
                <tr><td className="border border-gray-300 p-2">GPS</td><td className="border border-gray-300 p-2">Basic GPS sensor</td><td className="border border-gray-300 p-2">High-accuracy GPS + GLONASS</td></tr>
                <tr><td className="border border-gray-300 p-2">Sensors</td><td className="border border-gray-300 p-2">Accelerometer (for shake)</td><td className="border border-gray-300 p-2">Accelerometer + Gyroscope</td></tr>
                <tr><td className="border border-gray-300 p-2">Microphone</td><td className="border border-gray-300 p-2">Built-in mic</td><td className="border border-gray-300 p-2">Noise-cancelling mic</td></tr>
                <tr><td className="border border-gray-300 p-2">Browser</td><td className="border border-gray-300 p-2">Chrome 80+, Safari 14+</td><td className="border border-gray-300 p-2">Latest Chrome/Firefox/Edge</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">5.3 Application Specification</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <tbody>
                <tr><td className="border border-gray-300 p-2 font-semibold w-1/3">Application Type</td><td className="border border-gray-300 p-2">Progressive Web Application (PWA)</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Platform</td><td className="border border-gray-300 p-2">Cross-platform (Desktop + Mobile browsers)</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Authentication</td><td className="border border-gray-300 p-2">Email-based signup/login with session isolation per tab</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">User Roles</td><td className="border border-gray-300 p-2">User (safety seeker) and Helper (community volunteer)</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Deployment</td><td className="border border-gray-300 p-2">Cloud-hosted with CDN for static assets</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">API Architecture</td><td className="border border-gray-300 p-2">REST API with real-time subscriptions</td></tr>
                <tr><td className="border border-gray-300 p-2 font-semibold">Security</td><td className="border border-gray-300 p-2">RLS, RBAC, encrypted secrets, session isolation</td></tr>
              </tbody>
            </table>
          </section>

          {/* 6. SYSTEM DESIGN & DEVELOPMENT */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>6. SYSTEM DESIGN & DEVELOPMENT</h2>
            
            <h3 className="font-bold text-lg mb-3">6.1 Data Flow Diagram</h3>
            
            <h4 className="font-semibold mb-2">Level 0 DFD (Context Diagram)</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4 overflow-x-auto">
              <pre>{`
    ┌──────────┐                                    ┌──────────────┐
    │   User   │─── SOS/Check-in/Journey ──────►   │              │
    │ (Woman)  │◄── Alerts/Location/Status ──────   │   SafeHer    │
    └──────────┘                                    │   System     │
                                                    │              │
    ┌──────────┐                                    │              │
    │  Helper  │─── Accept/Navigate/OTP ────────►   │              │
    │(Volunteer│◄── Alerts/Rewards/Session ──────   │              │
    └──────────┘                                    └──────────────┘
                                                          │
    ┌──────────┐                                          │
    │Emergency │◄── Email with Location ──────────────────┘
    │ Contact  │
    └──────────┘

    ┌──────────┐
    │  Police  │◄── Live Location (Level 3 Escalation) ───┘
    │  (100)   │
    └──────────┘`}</pre>
            </div>

            <h4 className="font-semibold mb-2">Level 1 DFD - SOS Flow</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4 overflow-x-auto">
              <pre>{`
User ─── Press SOS ───► [1.0 SOS Module] ──► Create Incident (DB)
                              │                       │
                              ▼                       ▼
                        Capture GPS             [2.0 Notify Module]
                        Location                      │
                              │               ┌───────┼───────┐
                              ▼               ▼       ▼       ▼
                        Record Audio     SMS to   Email to   Alert Nearby
                        Evidence         Contacts  Contacts   Volunteers`}</pre>
            </div>

            <h4 className="font-semibold mb-2">Level 1 DFD - Check-In Escalation Flow</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4 overflow-x-auto">
              <pre>{`
User ──► Start Session ──► [Timer Countdown] ──► Check-in Due
                                                       │
                              ┌─────────── User checks in? ──────────────┐
                              │ YES                                │ NO  │
                              ▼                                          ▼
                        Reset Timer                              [Escalation]
                        Reset Miss Count                               │
                              │                        ┌───────────────┼───────────────┐
                              │                        ▼               ▼               ▼
                        [If late]                 1 miss:         2 misses:      3+ misses:
                        Show Dialog:              Toast           Email via       Email +
                        "Why didn't              Reminder        Resend API      Call Police
                         you check in?"                          + Google Maps    (tel:100) +
                        Collect reason                           link            Live Location`}</pre>
            </div>

            <h4 className="font-semibold mb-2">Level 1 DFD - Journey Tracking Flow</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4 overflow-x-auto">
              <pre>{`
User ──► Enter Destination + Transport Mode ──► [Start Journey]
                                                       │
                              ┌─────────────────────────┼─────────────────────┐
                              ▼                         ▼                     ▼
                        Save to DB              Email Contacts          Start GPS
                        (journeys table)        "Journey Started"      watchPosition
                              │                 with Maps link               │
                              ▼                                              ▼
                        [Track Progress] ◄────────────── Record Locations ───┘
                              │                         (journey_locations)
                              ▼
                     User clicks "I've Arrived"
                              │
                              ▼
                     Email Contacts "Arrived Safely"
                     End journey, stop tracking`}</pre>
            </div>

            <h4 className="font-semibold mb-2">Level 1 DFD - Volunteer Help Flow</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4 overflow-x-auto">
              <pre>{`
User Request ──► [Match Nearby Helpers] ──► Filter by radius (Haversine)
                                                       │
                                                       ▼
                                                Alert Sent to Helpers
                                                       │
                                            ┌──────────┼──────────┐
                                            ▼                     ▼
                                      Helper Accepts        Helper Declines
                                            │
                                            ▼
                               [Create Help Session + OTP]
                                            │
                                            ▼
                               [Navigation via Google Maps]
                               (Directions + ETA + Distance)
                                            │
                                            ▼
                                   OTP Verification on Arrival
                                            │
                                            ▼
                               Session Complete → Points Awarded
                               Rating + Feedback Collected`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">6.2 Entity Relationship Diagram</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4 overflow-x-auto">
              <pre>{`
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│     profiles     │         │    incidents     │         │     evidence     │
│──────────────────│         │──────────────────│         │──────────────────│
│ PK id (UUID)     │────1:N──│ PK id (UUID)     │────1:N──│ PK id (UUID)     │
│ full_name        │         │ FK user_id       │         │ FK incident_id   │
│ phone            │         │ incident_type    │         │ FK user_id       │
│ blood_group      │         │ status           │         │ media_type       │
│ role             │         │ latitude/longitude│        │ file_url         │
│ emergency_message│         │ message          │         │ duration_seconds │
│ avatar_url       │         │ created_at       │         │ latitude/longitude│
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │
        │ 1:N                        │ 1:N
        ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│emergency_contacts│         │ support_requests │
│──────────────────│         │──────────────────│
│ PK id (UUID)     │         │ PK id (UUID)     │
│ FK user_id       │         │ FK requester_id  │
│ name, phone      │         │ request_type     │
│ email            │         │ urgency          │
│ relationship     │         │ latitude/longitude│
│ is_primary       │         │ status           │
└──────────────────┘         └──────────────────┘
                                     │ 1:N
        ┌────────────────────────────┤
        ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│  help_sessions   │         │ volunteer_alerts │
│──────────────────│         │──────────────────│
│ PK id (UUID)     │         │ PK id (UUID)     │
│ FK support_req_id│         │ FK support_req_id│
│ FK volunteer_id  │         │ FK volunteer_id  │
│ FK requester_id  │         │ status, response │
│ otp_code         │         │ distance_km      │
│ status           │         └──────────────────┘
│ rating, feedback │
│ points_earned    │
└──────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   volunteers     │         │volunteer_rewards │         │    check_ins     │
│──────────────────│         │──────────────────│         │──────────────────│
│ PK id (UUID)     │────1:N──│ PK id (UUID)     │         │ PK id (UUID)     │
│ FK user_id       │         │ FK volunteer_id  │         │ FK user_id       │
│ full_name, phone │         │ points           │         │ status           │
│ is_available     │         │ reason           │         │ next_check_in_due│
│ rating, level    │         │ FK help_session_id│        │ location_lat/lng │
│ reward_points    │         └──────────────────┘         │ notes            │
│ badges[]         │                                      └──────────────────┘
│ notification_radius│
└──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│    journeys      │         │journey_locations │
│──────────────────│         │──────────────────│
│ PK id (UUID)     │────1:N──│ PK id (UUID)     │
│ FK user_id       │         │ FK journey_id    │
│ destination_name │         │ FK user_id       │
│ destination_lat/lng│       │ latitude/longitude│
│ start_lat/lng    │         │ accuracy         │
│ expected_arrival │         │ recorded_at      │
│ status           │         └──────────────────┘
└──────────────────┘`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">6.3 Input Design</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Input Form</th>
                  <th className="border border-gray-300 p-2 text-left">Fields</th>
                  <th className="border border-gray-300 p-2 text-left">Validation</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">User Registration</td><td className="border border-gray-300 p-2">Full Name, Email, Password</td><td className="border border-gray-300 p-2">Email format, Password min 6 chars</td></tr>
                <tr><td className="border border-gray-300 p-2">Emergency Contact</td><td className="border border-gray-300 p-2">Name, Phone, Email, Relationship, Primary flag</td><td className="border border-gray-300 p-2">Phone format, Email required for escalation</td></tr>
                <tr><td className="border border-gray-300 p-2">Journey Start</td><td className="border border-gray-300 p-2">Destination, Transport Mode, Estimated Time</td><td className="border border-gray-300 p-2">Destination required, GPS location auto-captured</td></tr>
                <tr><td className="border border-gray-300 p-2">Check-In Settings</td><td className="border border-gray-300 p-2">Interval (1-120 min), Contact selection</td><td className="border border-gray-300 p-2">At least 1 contact required</td></tr>
                <tr><td className="border border-gray-300 p-2">Volunteer Registration</td><td className="border border-gray-300 p-2">Full Name, Phone, Email</td><td className="border border-gray-300 p-2">All fields required</td></tr>
                <tr><td className="border border-gray-300 p-2">SOS Custom Message</td><td className="border border-gray-300 p-2">Message text (optional)</td><td className="border border-gray-300 p-2">Max 500 characters</td></tr>
                <tr><td className="border border-gray-300 p-2">Incident Report</td><td className="border border-gray-300 p-2">Type, Severity, Description, Location</td><td className="border border-gray-300 p-2">Type and location required</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">6.4 Output Design</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Output</th>
                  <th className="border border-gray-300 p-2 text-left">Format</th>
                  <th className="border border-gray-300 p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">SOS Alert</td><td className="border border-gray-300 p-2">SMS + Toast + DB Record</td><td className="border border-gray-300 p-2">Emergency alert with GPS coordinates and Google Maps link</td></tr>
                <tr><td className="border border-gray-300 p-2">Emergency Email</td><td className="border border-gray-300 p-2">HTML Email</td><td className="border border-gray-300 p-2">Formatted email with location, Maps link, action items, user info</td></tr>
                <tr><td className="border border-gray-300 p-2">Journey Notification</td><td className="border border-gray-300 p-2">HTML Email</td><td className="border border-gray-300 p-2">Journey start/arrival email with trackable Maps link</td></tr>
                <tr><td className="border border-gray-300 p-2">Helper Alert</td><td className="border border-gray-300 p-2">Real-time Card</td><td className="border border-gray-300 p-2">Urgency badge, distance, description, accept/decline buttons</td></tr>
                <tr><td className="border border-gray-300 p-2">Check-In Timer</td><td className="border border-gray-300 p-2">Countdown Display</td><td className="border border-gray-300 p-2">MM:SS format with color-coded urgency (green→yellow→red)</td></tr>
                <tr><td className="border border-gray-300 p-2">Safety Analytics</td><td className="border border-gray-300 p-2">Charts + Statistics</td><td className="border border-gray-300 p-2">Incident counts, check-in history, safety score</td></tr>
                <tr><td className="border border-gray-300 p-2">Volunteer Dashboard</td><td className="border border-gray-300 p-2">Cards + Map + Tabs</td><td className="border border-gray-300 p-2">Stats, alerts, session history, earnings, badges, leaderboard</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">6.5 Database Design</h3>
            <p className="text-sm mb-3">The system uses PostgreSQL with 18+ tables. All tables have Row-Level Security (RLS) enabled. Key tables:</p>
            <div className="overflow-x-auto space-y-3">
              {[
                { name: 'profiles', cols: 'id (PK/UUID), full_name, phone, blood_group, allergies[], medical_conditions[], emergency_message, avatar_url, role, created_at, updated_at', rls: 'Users can only CRUD their own profile (auth.uid() = id)' },
                { name: 'incidents', cols: 'id (PK), user_id (FK), incident_type (enum: sos/medical/fire/assault/accident), status (enum: active/resolved/cancelled/pending), latitude, longitude, altitude, message, address, created_at, resolved_at', rls: 'Users can INSERT/UPDATE/SELECT own incidents only' },
                { name: 'emergency_contacts', cols: 'id (PK), user_id (FK), name, phone, email, relationship, is_primary, created_at', rls: 'Full CRUD for own contacts only' },
                { name: 'check_ins', cols: 'id (PK), user_id (FK), status (active/missed/alerted), checked_in_at, location_lat, location_lng, next_check_in_due, notes, created_at', rls: 'Users can INSERT/UPDATE/SELECT own check-ins' },
                { name: 'journeys', cols: 'id (PK), user_id (FK), destination_name, destination_lat/lng, start_latitude/longitude, expected_arrival, status (active/completed/cancelled), created_at, completed_at', rls: 'Users can INSERT/UPDATE/SELECT own journeys' },
                { name: 'journey_locations', cols: 'id (PK), journey_id (FK→journeys), user_id (FK), latitude, longitude, accuracy, recorded_at', rls: 'Users can INSERT/SELECT own locations' },
                { name: 'volunteers', cols: 'id (PK), user_id (FK), full_name, phone, email, is_available, location_lat/lng, notification_radius_km, total_responses, rating, reward_points, badges[], level, verified', rls: 'Own profile + view available volunteers' },
                { name: 'help_sessions', cols: 'id (PK), support_request_id (FK), volunteer_id (FK), requester_id (FK), otp_code, otp_verified, status, volunteer_lat/lng, requester_lat/lng, distance_km, response_time_seconds, rating, feedback, points_earned', rls: 'Participants can view/update' },
                { name: 'volunteer_rewards', cols: 'id (PK), volunteer_id (FK), points, reason, help_session_id (FK), created_at', rls: 'Volunteers can view own rewards' },
                { name: 'evidence', cols: 'id (PK), user_id (FK), incident_id (FK), media_type, file_url, file_size, duration_seconds, latitude, longitude, captured_at', rls: 'Users can INSERT/SELECT/DELETE own evidence' },
                { name: 'user_settings', cols: 'id (PK), user_id (FK), shake_to_sos, countdown_sound, countdown_duration, voice_activation, auto_record_on_sos, silent_mode, check_in_interval, check_in_enabled, trigger_words[]', rls: 'Users can CRUD own settings' },
                { name: 'user_roles', cols: 'id (PK), user_id (FK), role (enum: user/helper), created_at, updated_at', rls: 'Users can INSERT/UPDATE/SELECT own role' },
              ].map((table) => (
                <div key={table.name} className="border rounded p-3 text-xs">
                  <h4 className="font-bold text-sm mb-1" style={{ color: '#dc2626' }}>{table.name}</h4>
                  <p><strong>Columns:</strong> {table.cols}</p>
                  <p className="mt-1"><strong>RLS:</strong> {table.rls}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 7. SYSTEM TESTING */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>7. SYSTEM TESTING</h2>
            
            <h3 className="font-bold text-lg mb-3">7.1 Unit Testing</h3>
            <p className="text-sm mb-2">Individual components and hooks were tested in isolation:</p>
            <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
              <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Unit</th><th className="border border-gray-300 p-2">Test Case</th><th className="border border-gray-300 p-2">Expected Result</th><th className="border border-gray-300 p-2">Status</th></tr></thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">SOSButton</td><td className="border border-gray-300 p-2">Press and hold for 2s</td><td className="border border-gray-300 p-2">Countdown starts from 5</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">useCheckIn hook</td><td className="border border-gray-300 p-2">Start session with 1-min interval</td><td className="border border-gray-300 p-2">Timer starts, state = active</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">useJourneyTracking</td><td className="border border-gray-300 p-2">startJourney() with valid params</td><td className="border border-gray-300 p-2">Journey created in DB, GPS watch started</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">useEmergencyContacts</td><td className="border border-gray-300 p-2">addContact() with email</td><td className="border border-gray-300 p-2">Contact saved, list updated</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">useShakeDetection</td><td className="border border-gray-300 p-2">3 rapid device shakes</td><td className="border border-gray-300 p-2">onShake callback triggered</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">useVoiceActivation</td><td className="border border-gray-300 p-2">Say "help me"</td><td className="border border-gray-300 p-2">Trigger word detected, SOS initiated</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">7.2 Integration Testing</h3>
            <p className="text-sm mb-2">End-to-end flows across multiple components and backend services:</p>
            <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
              <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Flow</th><th className="border border-gray-300 p-2">Components Involved</th><th className="border border-gray-300 p-2">Result</th><th className="border border-gray-300 p-2">Status</th></tr></thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">SOS → Volunteer Alert</td><td className="border border-gray-300 p-2">SOSButton → DB → Edge Function → VolunteerAlerts</td><td className="border border-gray-300 p-2">Volunteers within radius receive alert</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Check-In → Email</td><td className="border border-gray-300 p-2">CheckInSystem → useCheckIn → Edge Function → Resend API</td><td className="border border-gray-300 p-2">Email sent with Maps link on 2nd miss</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Journey → Email</td><td className="border border-gray-300 p-2">JourneyTracker → useJourneyTracking → Edge Function</td><td className="border border-gray-300 p-2">Contacts receive start/arrival emails</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">Helper Accept → Navigate</td><td className="border border-gray-300 p-2">VolunteerAlerts → HelpSession → HelperNavigationView</td><td className="border border-gray-300 p-2">Google Maps navigation with ETA</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
                <tr><td className="border border-gray-300 p-2">OTP → Points</td><td className="border border-gray-300 p-2">HelpSession → OTP verify → VolunteerRewards</td><td className="border border-gray-300 p-2">Points awarded, session completed</td><td className="border border-gray-300 p-2 text-green-600">✅ Pass</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">7.3 System Testing</h3>
            <p className="text-sm mb-4">Complete system tested for overall functionality, performance, and reliability across different devices and browsers. All features verified working together without conflicts between User and Helper roles.</p>

            <h3 className="font-bold text-lg mb-3">7.4 Acceptance Testing</h3>
            <p className="text-sm mb-4">User acceptance testing performed with target users (women commuters) to validate usability, safety features, and emergency response times. Feedback incorporated into UI improvements including larger SOS button, simplified check-in flow, and clearer escalation warnings.</p>

            <h3 className="font-bold text-lg mb-3">7.5 Black Box Testing</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
              <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Test Case</th><th className="border border-gray-300 p-2">Input</th><th className="border border-gray-300 p-2">Expected Output</th><th className="border border-gray-300 p-2">Actual Output</th><th className="border border-gray-300 p-2">Status</th></tr></thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">Login with valid credentials</td><td className="border border-gray-300 p-2">Valid email + password</td><td className="border border-gray-300 p-2">Dashboard loads</td><td className="border border-gray-300 p-2">Dashboard loads correctly</td><td className="border border-gray-300 p-2 text-green-600">✅</td></tr>
                <tr><td className="border border-gray-300 p-2">Login with invalid password</td><td className="border border-gray-300 p-2">Valid email + wrong password</td><td className="border border-gray-300 p-2">Error message shown</td><td className="border border-gray-300 p-2">Error toast displayed</td><td className="border border-gray-300 p-2 text-green-600">✅</td></tr>
                <tr><td className="border border-gray-300 p-2">SOS without GPS</td><td className="border border-gray-300 p-2">SOS press, GPS denied</td><td className="border border-gray-300 p-2">Alert sent without coords</td><td className="border border-gray-300 p-2">Alert sent, location = null</td><td className="border border-gray-300 p-2 text-green-600">✅</td></tr>
                <tr><td className="border border-gray-300 p-2">Add contact without email</td><td className="border border-gray-300 p-2">Name + phone only</td><td className="border border-gray-300 p-2">Contact saved, email = null</td><td className="border border-gray-300 p-2">Contact saved correctly</td><td className="border border-gray-300 p-2 text-green-600">✅</td></tr>
                <tr><td className="border border-gray-300 p-2">Start journey without destination</td><td className="border border-gray-300 p-2">Empty destination field</td><td className="border border-gray-300 p-2">Validation error</td><td className="border border-gray-300 p-2">Toast: "Enter destination"</td><td className="border border-gray-300 p-2 text-green-600">✅</td></tr>
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-3">7.6 White Box Testing</h3>
            <p className="text-sm mb-2">Internal logic paths verified for critical modules:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4 mb-4">
              <li><strong>Check-in escalation logic:</strong> All 3 branch paths (1 miss → toast, 2 miss → email, 3+ miss → police) tested independently</li>
              <li><strong>Haversine distance calculation:</strong> Verified with known coordinates (e.g., Mumbai to Pune = ~150 km)</li>
              <li><strong>OTP generation:</strong> 4-digit random generation verified for uniqueness across sessions</li>
              <li><strong>Session storage isolation:</strong> Verified that separate tabs maintain independent auth sessions</li>
              <li><strong>RLS policy enforcement:</strong> Attempted cross-user data access returns empty results</li>
              <li><strong>Edge function error handling:</strong> Invalid API keys, missing contacts, and network failures all return graceful error responses</li>
            </ul>

            <h3 className="font-bold text-lg mb-3">7.7 Validation Testing</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
              <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Field</th><th className="border border-gray-300 p-2">Valid Input</th><th className="border border-gray-300 p-2">Invalid Input</th><th className="border border-gray-300 p-2">Error Handling</th></tr></thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">Email</td><td className="border border-gray-300 p-2">user@domain.com</td><td className="border border-gray-300 p-2">userdomaincom</td><td className="border border-gray-300 p-2">Form validation error shown</td></tr>
                <tr><td className="border border-gray-300 p-2">Phone</td><td className="border border-gray-300 p-2">+91XXXXXXXXXX</td><td className="border border-gray-300 p-2">abc123</td><td className="border border-gray-300 p-2">Input restricted to numbers</td></tr>
                <tr><td className="border border-gray-300 p-2">Check-in interval</td><td className="border border-gray-300 p-2">1-120 minutes</td><td className="border border-gray-300 p-2">0 or negative</td><td className="border border-gray-300 p-2">Dropdown restricts to valid options</td></tr>
                <tr><td className="border border-gray-300 p-2">OTP code</td><td className="border border-gray-300 p-2">4-digit number</td><td className="border border-gray-300 p-2">Wrong OTP</td><td className="border border-gray-300 p-2">Error toast: "Invalid OTP"</td></tr>
                <tr><td className="border border-gray-300 p-2">Password</td><td className="border border-gray-300 p-2">6+ characters</td><td className="border border-gray-300 p-2">Less than 6 chars</td><td className="border border-gray-300 p-2">Auth error message</td></tr>
              </tbody>
            </table>
          </section>

          {/* 8. SYSTEM IMPLEMENTATION AND MAINTENANCE */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>8. SYSTEM IMPLEMENTATION AND MAINTENANCE</h2>
            
            <h3 className="font-bold text-lg mb-3">8.1 Implementation Architecture</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono mb-4 overflow-x-auto">
              <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React 18 + TypeScript)         │
├─────────────────────────────────────────────────────────────────┤
│  User Dashboard: SOS | Journey | Check-In | Evidence | Map     │
│  Helper Dashboard: Requests | Map | Rewards | History | Stats  │
│  Hooks: useGeolocation | useShakeDetection | useVoiceActivation│
│  State: TanStack Query | React Context | sessionStorage        │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Cloud Backend)                    │
├─────────────────────────────────────────────────────────────────┤
│  REST API | Realtime Subscriptions | Edge Functions (Deno)      │
│  Authentication (Email) | Row-Level Security | File Storage     │
│  Edge Functions:                                                │
│    send-emergency-email → Resend API                           │
│    safety-analysis → Gemini AI                                 │
│    notify-volunteers → Proximity matching                      │
│    get-maps-key → Secure API key delivery                      │
└─────────────────────────────────────────────────────────────────┘
                              │ Encrypted
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (PostgreSQL 15)                 │
├─────────────────────────────────────────────────────────────────┤
│  18+ Tables with RLS Policies on every table                   │
│  profiles | incidents | volunteers | support_requests          │
│  help_sessions | check_ins | journeys | journey_locations      │
│  emergency_contacts | evidence | volunteer_rewards             │
│  user_settings | user_roles | safety_analytics                 │
│  Security: RLS | Triggers | Security Definer Functions         │
└─────────────────────────────────────────────────────────────────┘`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.2 Key Implementation Code</h3>
            
            <h4 className="font-semibold mb-2">SOS Button Implementation</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-3 overflow-x-auto">
              <pre>{`// SOSButton.tsx - Emergency trigger with countdown
const handleSOSTrigger = async () => {
  setIsCountingDown(true);
  setCountdown(settings?.countdown_duration || 5);
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) { clearInterval(timer); executeEmergency(); return 0; }
      return prev - 1;
    });
  }, 1000);
};`}</pre>
            </div>

            <h4 className="font-semibold mb-2">Check-In Escalation Logic</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-3 overflow-x-auto">
              <pre>{`// useCheckIn.ts - 3-tier automated escalation
const handleMissedCheckIn = async () => {
  const newMissedCount = missedCount + 1;
  if (newMissedCount === 1) {
    toast.warning('Are you okay? Please confirm you are safe.');
  } else if (newMissedCount === 2) {
    // Level 2: Send emergency email with live GPS location
    await supabase.functions.invoke('send-emergency-email', {
      body: { user_id, latitude, longitude, missed_count: newMissedCount }
    });
  } else if (newMissedCount >= 3) {
    // Level 3: Email + Police call + Live location broadcast
    await sendEmergencyEmail();
    window.location.href = 'tel:100'; // Trigger police call
  }
};`}</pre>
            </div>

            <h4 className="font-semibold mb-2">Emergency Email Edge Function</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-3 overflow-x-auto">
              <pre>{`// send-emergency-email/index.ts - Resend API integration
const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${RESEND_API_KEY}\` },
  body: JSON.stringify({
    from: "SafeHer Emergency <onboarding@resend.dev>",
    to: [contact.email],
    subject: "URGENT: Missed safety check-ins - ACTION REQUIRED",
    html: /* HTML with Google Maps link, user info, action items */
  })
});`}</pre>
            </div>

            <h3 className="font-bold text-lg mb-3">8.3 Maintenance Plan</h3>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li><strong>Database Backups:</strong> Automated daily backups with point-in-time recovery</li>
              <li><strong>Dependency Updates:</strong> Monthly security patch updates via npm audit</li>
              <li><strong>Edge Function Monitoring:</strong> Log monitoring for email delivery failures and API errors</li>
              <li><strong>Performance:</strong> TanStack Query caching reduces redundant API calls; code-splitting via Vite</li>
              <li><strong>Security Patches:</strong> RLS policies audited quarterly; API keys rotated as needed</li>
            </ul>
          </section>

          {/* 9. CONCLUSION */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>9. CONCLUSION</h2>
            <p className="mb-4">
              The SafeHer Women Safety Application successfully addresses the critical gaps in existing safety solutions by providing a unified, intelligent, and community-driven platform. The project demonstrates the effective use of modern web technologies to create a production-ready safety ecosystem.
            </p>
            <p className="mb-4"><strong>Key Achievements:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Comprehensive Safety Ecosystem:</strong> SOS, check-ins, journey tracking, evidence recording, and AI analysis unified in one platform</li>
              <li><strong>3-Tier Automated Escalation:</strong> Progressive response from reminder → email notification with GPS → police alert with live location, requiring zero manual intervention</li>
              <li><strong>Community Volunteer Network:</strong> Real-time proximity matching using Haversine formula, OTP-verified help sessions, integrated Google Maps tracking, and gamified reward system with 5 levels and 6 badges</li>
              <li><strong>Real-Time Journey Tracking:</strong> WhatsApp-style live location sharing with expiry, transport mode selection, and automated email notifications to emergency contacts</li>
              <li><strong>Role-Based Architecture:</strong> Clean separation between User and Helper experiences with session isolation per browser tab</li>
              <li><strong>Production-Ready Security:</strong> RLS policies on all 18+ tables, RBAC via security definer functions, encrypted secrets, and session isolation</li>
            </ul>
            <p>
              The application serves as a comprehensive model for how technology can be leveraged to enhance women's safety through community participation, automated emergency response, and intelligent risk assessment.
            </p>
          </section>

          {/* 10. FUTURE ENHANCEMENTS */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>10. FUTURE ENHANCEMENTS</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong>Native Mobile App:</strong> Build iOS and Android apps using Capacitor for push notifications, background GPS tracking, and native sensor access</li>
              <li><strong>Predictive Safety Scoring:</strong> Machine learning model trained on historical incident data to predict area safety in real-time</li>
              <li><strong>Government Integration:</strong> Direct API integration with police emergency services (112/100) for automatic dispatch</li>
              <li><strong>Multi-Language Support:</strong> Hindi, Tamil, Telugu, and other regional language interfaces for broader accessibility</li>
              <li><strong>Wearable Device Support:</strong> Integration with smartwatches and fitness bands for hands-free SOS triggers via heart-rate anomaly detection</li>
              <li><strong>Blockchain Evidence Chain:</strong> Immutable evidence timestamping using blockchain for legal admissibility</li>
              <li><strong>Offline-First Architecture:</strong> Complete offline functionality with background sync for areas with poor network coverage</li>
              <li><strong>Corporate Safety Programs:</strong> Enterprise features for organizations to monitor employee safety during travel</li>
              <li><strong>Video Call Escalation:</strong> Live video stream to emergency contacts during Level 3 escalation</li>
              <li><strong>Crowdsourced Safety Maps:</strong> Community-reported incident heatmaps with verified data points</li>
            </ol>
          </section>

          {/* 11. BIBLIOGRAPHY */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>11. BIBLIOGRAPHY</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
              <li>React Documentation - <em>https://react.dev</em> - Official React 18 documentation for component-based UI development</li>
              <li>TypeScript Handbook - <em>https://www.typescriptlang.org/docs</em> - Type safety and advanced patterns</li>
              <li>Tailwind CSS Documentation - <em>https://tailwindcss.com/docs</em> - Utility-first CSS framework</li>
              <li>shadcn/ui Components - <em>https://ui.shadcn.com</em> - Accessible, customizable UI components built on Radix UI</li>
              <li>PostgreSQL Documentation - <em>https://www.postgresql.org/docs</em> - Relational database with Row-Level Security</li>
              <li>Google Maps JavaScript API - <em>https://developers.google.com/maps/documentation/javascript</em> - Maps, Places, Directions, and Geocoding APIs</li>
              <li>Resend API Documentation - <em>https://resend.com/docs</em> - Email delivery API for transactional emails</li>
              <li>Deno Runtime - <em>https://deno.land</em> - Secure runtime for Edge Functions</li>
              <li>TanStack Query - <em>https://tanstack.com/query</em> - Server state management and caching</li>
              <li>National Crime Records Bureau (NCRB) - "Crime in India" annual reports for safety statistics</li>
              <li>World Health Organization - "Violence Against Women" prevalence data and prevention strategies</li>
              <li>Haversine Formula - R.W. Sinnott, "Virtues of the Haversine", Sky and Telescope, vol. 68, no. 2, 1984</li>
            </ol>
          </section>

          {/* 12. APPENDIX */}
          <section>
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>12. APPENDIX</h2>
            
            <h3 className="font-bold text-lg mb-3">Appendix A: Data Flow Diagrams</h3>
            <p className="text-sm mb-2">Complete DFDs are provided in Section 6.1 above, including:</p>
            <ul className="list-disc list-inside text-sm ml-4 mb-4">
              <li>Level 0 Context Diagram showing all external entities</li>
              <li>Level 1 DFD for SOS Emergency Flow</li>
              <li>Level 1 DFD for Check-In Escalation Flow</li>
              <li>Level 1 DFD for Journey Tracking Flow</li>
              <li>Level 1 DFD for Volunteer Help Flow</li>
            </ul>

            <h3 className="font-bold text-lg mb-3">Appendix B: Entity Relationship Diagram</h3>
            <p className="text-sm mb-4">Complete ER diagram is provided in Section 6.2, showing all 18+ tables with their relationships, primary keys, foreign keys, and cardinality notations.</p>

            <h3 className="font-bold text-lg mb-3">Appendix C: Database Design</h3>
            <p className="text-sm mb-4">Detailed database schema with all columns, data types, constraints, default values, and RLS policies is provided in Section 6.5.</p>

            <h3 className="font-bold text-lg mb-3">Appendix D: Sample Screen Shots</h3>
            <div className="space-y-3 text-sm">
              <p>The application includes the following key screens (accessible via the live application):</p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li><strong>Authentication Page:</strong> Email signup/login with role selection (User/Helper)</li>
                <li><strong>User Dashboard:</strong> SOS button, safety check-in, journey tracker, nearby places, safety analytics</li>
                <li><strong>Helper Dashboard:</strong> Status toggle, help requests map, alerts with accept/decline, session history, rewards & badges, leaderboard</li>
                <li><strong>Safety Check-In:</strong> Timer countdown, contact selector, escalation warnings, late check-in dialog</li>
                <li><strong>Journey Tracker:</strong> Destination input, transport mode selector, live tracking status, arrival confirmation</li>
                <li><strong>Emergency Email:</strong> HTML-formatted email with Google Maps link, user info, and action items</li>
                <li><strong>Helper Navigation:</strong> Uber-style map with directions, ETA, and distance to requester</li>
                <li><strong>Volunteer Rewards:</strong> Points display, level progress, badges gallery, earnings history, milestones</li>
                <li><strong>Settings:</strong> SOS configuration, shake detection, voice activation, check-in preferences</li>
                <li><strong>Evidence Library:</strong> Audio recordings with playback, GPS metadata, cloud backup status</li>
              </ol>
            </div>

            <h3 className="font-bold text-lg mb-3 mt-4">Appendix E: Source Code Structure</h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
              <pre>{`
src/
├── components/                 # Reusable UI components
│   ├── SOSButton.tsx          # Emergency SOS trigger with countdown
│   ├── CheckInSystem.tsx      # Safety check-in with escalation UI
│   ├── JourneyTracker.tsx     # Journey tracking with live location
│   ├── ContactsManager.tsx    # Emergency contact CRUD
│   ├── SafetyMapReal.tsx      # Google Maps with incidents
│   ├── AISafetyAssistant.tsx  # AI-powered safety analysis
│   ├── AudioRecorder.tsx      # Evidence audio recording
│   ├── volunteer/
│   │   ├── VolunteerDashboard.tsx   # Helper main dashboard
│   │   ├── HelperMapView.tsx        # Map with active requests
│   │   ├── HelperNavigationView.tsx # Turn-by-turn navigation
│   │   ├── HelperSessionHistory.tsx # Session & earnings log
│   │   ├── VolunteerRewards.tsx     # Points, badges, levels
│   │   └── VolunteerRegistration.tsx# Helper signup form
│   └── ui/                    # shadcn/ui base components
├── hooks/                     # Custom React hooks
│   ├── useCheckIn.ts          # Check-in logic with 3-tier escalation
│   ├── useJourneyTracking.ts  # Journey CRUD and GPS tracking
│   ├── useEmergencyContacts.ts# Contact management
│   ├── useGeolocation.ts      # GPS location tracking
│   ├── useShakeDetection.ts   # Accelerometer shake detection
│   ├── useVoiceActivation.ts  # Speech recognition for trigger words
│   ├── useVolunteers.ts       # Volunteer data and alerts
│   └── useHelpSession.ts      # Help session management with OTP
├── pages/                     # Route pages
│   ├── Index.tsx              # Role-based dashboard router
│   ├── Auth.tsx               # Login/Signup page
│   ├── Settings.tsx           # User preferences
│   ├── Documentation.tsx      # This documentation page
│   └── HelperDashboard.tsx    # Helper-specific dashboard
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
└── supabase/
    └── functions/
        ├── send-emergency-email/  # Resend API email delivery
        ├── safety-analysis/       # AI safety assessment
        ├── notify-volunteers/     # Proximity-based volunteer alerts
        └── get-maps-key/          # Secure Maps API key delivery`}</pre>
            </div>
          </section>

          {/* Resend Email Setup Guide */}
          <section className="mt-8 border-t-2 border-gray-300 pt-8">
            <h2 className="text-xl font-bold border-b-2 pb-2 mb-4" style={{ borderColor: '#dc2626' }}>APPENDIX F: RESEND EMAIL SETUP GUIDE</h2>
            
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500 mb-4">
              <p className="font-semibold text-blue-700">How Emergency Emails Work in SafeHer</p>
              <p className="text-sm mt-2">When a user misses 2+ safety check-ins, the system automatically calls the <code>send-emergency-email</code> Edge Function, which uses the Resend API to send HTML-formatted emails containing the user's live GPS coordinates and a Google Maps link to all selected emergency contacts.</p>
            </div>

            <h3 className="font-bold text-lg mb-3">Step-by-Step Resend Setup</h3>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h4 className="font-bold mb-2">Step 1: Create a Resend Account</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                  <li>Go to <strong>https://resend.com</strong></li>
                  <li>Click <strong>"Get Started"</strong> or <strong>"Sign Up"</strong></li>
                  <li>Sign up with your GitHub account or email address</li>
                  <li>Verify your email if signing up with email</li>
                </ol>
              </div>

              <div className="border rounded p-4">
                <h4 className="font-bold mb-2">Step 2: Get Your API Key</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                  <li>After logging in, go to the <strong>Resend Dashboard</strong></li>
                  <li>Navigate to <strong>API Keys</strong> in the left sidebar</li>
                  <li>Click <strong>"Create API Key"</strong></li>
                  <li>Name it something like <strong>"SafeHer Emergency Emails"</strong></li>
                  <li>Set permission to <strong>"Sending access"</strong> (Full access also works)</li>
                  <li>Click <strong>"Add"</strong></li>
                  <li>⚠️ <strong>IMPORTANT:</strong> Copy the API key immediately — it's only shown once!</li>
                  <li>The key format looks like: <code>re_xxxxxxxxxxxxxxxxxxxxxxxxx</code></li>
                </ol>
              </div>

              <div className="border rounded p-4">
                <h4 className="font-bold mb-2">Step 3: Configure the API Key in Your Project</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                  <li>In your project's Cloud settings, add a secret named <strong>RESEND_API_KEY</strong></li>
                  <li>Paste the API key value you copied from Resend</li>
                  <li>The Edge Function (<code>send-emergency-email</code>) will automatically use this key</li>
                </ol>
              </div>

              <div className="border rounded p-4">
                <h4 className="font-bold mb-2">Step 4: Sending Emails (Free Tier)</h4>
                <p className="text-sm mb-2">On Resend's free tier:</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>You can send up to <strong>100 emails/day</strong> and <strong>3,000 emails/month</strong></li>
                  <li>Emails are sent from <code>onboarding@resend.dev</code> (Resend's shared domain)</li>
                  <li>⚠️ <strong>Free tier limitation:</strong> You can only send to the email address you signed up with on Resend</li>
                  <li>To send to any email address, you need to <strong>verify a custom domain</strong> (see Step 5)</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h4 className="font-bold mb-2">Step 5: Verify a Custom Domain (For Production)</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                  <li>In Resend dashboard, go to <strong>Domains</strong></li>
                  <li>Click <strong>"Add Domain"</strong></li>
                  <li>Enter your domain (e.g., <code>yourdomain.com</code>)</li>
                  <li>Add the DNS records (MX, TXT) shown by Resend to your domain's DNS settings</li>
                  <li>Wait for verification (usually a few minutes)</li>
                  <li>Once verified, update the Edge Function's <code>from</code> field to use your domain</li>
                </ol>
              </div>

              <div className="border rounded p-4">
                <h4 className="font-bold mb-2">Step 6: View Sent Emails in Resend</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                  <li>Go to <strong>https://resend.com/emails</strong> after logging in</li>
                  <li>You'll see a list of all sent emails with delivery status</li>
                  <li>Click on any email to see the full HTML content, delivery time, and recipient</li>
                  <li>Check <strong>"Failed"</strong> tab for any delivery failures</li>
                </ol>
              </div>

              <div className="border rounded p-4 bg-yellow-50">
                <h4 className="font-bold mb-2">⚠️ Common Issues & Troubleshooting</h4>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li><strong>"API key is invalid":</strong> Regenerate the API key in Resend dashboard and update the secret</li>
                  <li><strong>"You can only send to your own email":</strong> Verify a custom domain or use the email you signed up with</li>
                  <li><strong>Email not received:</strong> Check spam/junk folder; check Resend dashboard for delivery status</li>
                  <li><strong>"No contacts have email":</strong> Ensure emergency contacts have email addresses added</li>
                </ul>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-3 mt-4">Email Flow Diagram</h3>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono overflow-x-auto">
              <pre>{`
User misses check-in
       │
       ▼
[useCheckIn.ts] → Increment missedCount
       │
       ├── missedCount = 1 → Toast reminder only
       │
       ├── missedCount = 2 → Call Edge Function
       │                           │
       │                           ▼
       │              [send-emergency-email/index.ts]
       │                           │
       │                    ┌──────┼──────┐
       │                    ▼             ▼
       │              Fetch contacts   Fetch profile
       │              (with email)     (name, phone)
       │                    │
       │                    ▼
       │              Build HTML email with:
       │              - Google Maps link
       │              - GPS coordinates
       │              - User name & phone
       │              - Action items
       │                    │
       │                    ▼
       │              POST to api.resend.com/emails
       │              Authorization: Bearer RESEND_API_KEY
       │                    │
       │                    ▼
       │              Email delivered to contact
       │
       └── missedCount >= 3 → Email + Call Police (tel:100)
                              + Live location broadcast`}</pre>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Documentation;
