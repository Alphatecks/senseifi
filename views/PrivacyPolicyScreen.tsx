const EFFECTIVE_DATE = "April 18, 2026";
const LAST_UPDATED = "April 18, 2026";
const CONTACT_EMAIL = "privacy@senseifi.com";
const WEBSITE_URL = "https://senseifi.io";

export default function PrivacyPolicyScreen() {
  return (
    <article className="w-full bg-[#0a0a1a] text-white pt-28 md:pt-32 pb-20">
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full border border-blue-400/60 px-4 py-1 text-sm text-blue-300 mb-6">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-normal leading-tight text-white">Privacy Policy</h1>
          <p className="mt-2 text-lg text-white/90 font-medium">SenseiFi</p>
          <div className="mt-4 space-y-1 text-sm text-white/70">
            <p>
              <span className="text-white/50">Effective Date:</span> {EFFECTIVE_DATE}
            </p>
            <p>
              <span className="text-white/50">Last Updated:</span> {LAST_UPDATED}
            </p>
          </div>

          <hr className="my-10 border-white/10" />

          <div className="max-w-none text-white/75 text-sm md:text-base leading-relaxed [&_strong]:text-white">
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10 first:mt-0">1. Introduction</h2>
              <p>
                SenseiFi (&quot;SenseiFi,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to safeguarding the privacy,
                confidentiality, and integrity of user data. This Privacy Policy explains how we collect, use, disclose, and protect
                information in connection with our decentralized finance security platform, including our mobile applications, browser
                extensions, web dashboard, and related services (collectively, the &quot;Services&quot;).
              </p>
              <p>
                SenseiFi operates at the intersection of blockchain technology, artificial intelligence, and digital payments, offering
                tools such as wallet security monitoring, transaction analysis, trading intelligence, and crypto-based payment solutions.
                Given the nature of decentralized systems, we are deliberate in minimizing data collection while maintaining high
                standards of security and usability.
              </p>
              <p>By accessing or using SenseiFi, you acknowledge that you have read and understood this Privacy Policy.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">2. Information We Collect</h2>
              <p>We adopt a data-minimization approach. The categories of information we may collect include:</p>

              <h3 className="text-lg text-white font-normal mt-8">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account details (e.g., email address, username)</li>
                <li>Subscription and billing information</li>
                <li>Customer support communications</li>
              </ul>

              <h3 className="text-lg text-white font-normal mt-8">2.2 Wallet and Blockchain Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Public wallet addresses</li>
                <li>Transaction metadata (e.g., contract interactions, token approvals)</li>
                <li>On-chain activity necessary for risk analysis and security alerts</li>
              </ul>
              <p>
                <strong>Important:</strong> SenseiFi does <strong>not</strong> collect or store private keys, seed phrases, or wallet
                credentials.
              </p>

              <h3 className="text-lg text-white font-normal mt-8">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device and browser information</li>
                <li>IP address and approximate geolocation</li>
                <li>Usage analytics (features accessed, session duration)</li>
                <li>Log data (errors, system diagnostics)</li>
              </ul>

              <h3 className="text-lg text-white font-normal mt-8">2.4 AI and Security Analysis Data</h3>
              <p>To provide intelligent insights and protection:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Smart contract interaction patterns</li>
                <li>Token behavior and risk signals</li>
                <li>Phishing URLs and suspicious domain interactions</li>
                <li>Transaction simulation inputs and outputs</li>
              </ul>

              <h3 className="text-lg text-white font-normal mt-8">2.5 Payment and Card Data (SenseiCard™)</h3>
              <p>Where applicable:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Card issuance data (processed via third-party providers)</li>
                <li>Transaction records and spending analytics</li>
                <li>Fiat conversion metadata</li>
              </ul>
              <p>
                <strong>Note:</strong> Sensitive payment data is handled by regulated third-party payment processors and is not stored
                directly by SenseiFi.
              </p>

              <h3 className="text-lg text-white font-normal mt-8">2.6 SenseiFi Trade Insight (SenseiGuard) browser extension</h3>
              <p>
                If you install our Chrome extension (&quot;SenseiFi Trade Insight&quot; / SenseiGuard), the following applies in addition to the
                categories above. We keep this list aligned with what the extension actually stores and sends.
              </p>
              <p>
                <strong>Local storage on your device (via Chrome <code className="text-white/90">storage.local</code>):</strong> user
                protection settings (thresholds, toggles), a list of recent security alerts, a cache of threat-intelligence data fetched
                from our servers, your wallet session / connected public address after you connect, a short queue of security-relevant
                events pending upload, and per-tab domain risk snapshots used to show warnings. We do{" "}
                <strong>not</strong> store private keys, seed phrases, or wallet secrets in the extension.
              </p>
              <p>
                <strong>Network requests to our API (HTTPS):</strong> the extension may call our backend to (a) analyze a pending
                transaction or signing request, (b) check dApp/site context when connecting, (c) register your connected wallet address
                and chain when you choose to connect, (d) download a periodic threat feed (e.g. malicious contract/domain lists), and (e)
                send queued telemetry events (for example transaction evaluation outcomes, domain-risk detections, and sync heartbeats).
                Payloads are limited to what is needed for security analysis and service operation.
              </p>
              <p>
                <strong>Site access:</strong> broad access to websites you visit (<code className="text-white/90">http(s)://*/*</code>) is{" "}
                <strong>optional</strong> and requested when you enable site protection or connect a wallet from the extension, so we can
                inject our protection script and interact with the page&apos;s wallet provider on dApps. If you do not grant this access,
                in-page protection and wallet connect on normal tabs will not work until you allow it. Access to our API host is separate
                and used for the requests described above.
              </p>
              <p>
                <strong>Notifications:</strong> the extension may show system notifications when we block or warn on a high-risk
                transaction or flag a suspicious domain, so you notice even if the tab is in the background.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">3. How We Use Information</h2>
              <p>We process data for the following purposes:</p>

              <h3 className="text-lg text-white font-normal mt-8">3.1 Service Delivery</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide wallet protection, transaction analysis, and alerts</li>
                <li>Enable AI-driven trading insights and recommendations</li>
                <li>Facilitate crypto-to-fiat payment functionality</li>
              </ul>

              <h3 className="text-lg text-white font-normal mt-8">3.2 Security and Fraud Prevention</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Detect malicious smart contracts and phishing attempts</li>
                <li>Prevent unauthorized wallet interactions</li>
                <li>Monitor for suspicious or anomalous behavior</li>
              </ul>

              <h3 className="text-lg text-white font-normal mt-8">3.3 AI Model Improvement</h3>
              <p>Train and refine machine learning models for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Threat detection</li>
                <li>Token risk scoring</li>
                <li>Market intelligence</li>
              </ul>
              <p>All such processing is conducted using aggregated or pseudonymized data where possible.</p>

              <h3 className="text-lg text-white font-normal mt-8">3.4 Communications</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send service updates, alerts, and notifications</li>
                <li>Provide customer support</li>
                <li>Deliver security warnings in real time</li>
              </ul>

              <h3 className="text-lg text-white font-normal mt-8">3.5 Compliance and Legal Obligations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with applicable laws and regulatory requirements</li>
                <li>Enforce our Terms of Service</li>
                <li>Prevent abuse of the platform</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">4. Legal Basis for Processing</h2>
              <p>Where applicable under data protection laws, we rely on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Contractual necessity</strong> – to provide the Services
                </li>
                <li>
                  <strong>Legitimate interests</strong> – for security, analytics, and product improvement
                </li>
                <li>
                  <strong>Consent</strong> – where required (e.g., marketing communications)
                </li>
                <li>
                  <strong>Legal obligations</strong> – compliance with financial and regulatory frameworks
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">5. Data Sharing and Disclosure</h2>
              <p>We do <strong>not sell user data</strong>. We may share information in the following limited circumstances:</p>

              <h3 className="text-lg text-white font-normal mt-8">5.1 Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloud infrastructure providers</li>
                <li>AI processing services</li>
                <li>Payment processors and card issuers</li>
              </ul>
              <p>These parties are contractually bound to protect your data.</p>

              <h3 className="text-lg text-white font-normal mt-8">5.2 Blockchain Transparency</h3>
              <p>Due to the nature of blockchain technology:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transactions are publicly visible on-chain</li>
                <li>Wallet addresses may be traceable</li>
              </ul>
              <p>SenseiFi does not control blockchain data visibility.</p>

              <h3 className="text-lg text-white font-normal mt-8">5.3 Legal and Regulatory Requests</h3>
              <p>We may disclose data where required to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with legal obligations</li>
                <li>Respond to lawful requests by authorities</li>
                <li>Protect users, the platform, or the public</li>
              </ul>

              <h3 className="text-lg text-white font-normal mt-8">5.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or restructuring, user data may be transferred subject to confidentiality
                obligations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">6. Data Security</h2>
              <p>We implement industry-grade security measures, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption (where applicable)</li>
                <li>Secure API architecture</li>
                <li>Continuous monitoring and threat detection</li>
                <li>Zero-access design for sensitive wallet credentials</li>
                <li>AI-driven anomaly detection systems</li>
              </ul>
              <p>
                Despite these safeguards, no system is entirely immune to risk. Users are encouraged to maintain strong personal security
                practices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">7. Data Retention</h2>
              <p>We retain data only as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Improve platform functionality</li>
              </ul>
              <p>Blockchain data, by design, may remain permanently accessible on public ledgers.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Restrict or object to processing</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>
                Requests can be submitted via:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-300 hover:text-blue-200 underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">9. International Data Transfers</h2>
              <p>SenseiFi may process data across multiple jurisdictions. Where applicable, we ensure appropriate safeguards such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard contractual clauses</li>
                <li>Secure data transfer protocols</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">10. Third-Party Services</h2>
              <p>
                SenseiFi integrates with third-party services (e.g., wallet providers, payment processors, blockchain networks). Their
                privacy practices are governed by their respective policies.
              </p>
              <p>We encourage users to review those policies independently.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">11. Children&apos;s Privacy</h2>
              <p>SenseiFi is not intended for individuals under the age of 18. We do not knowingly collect data from minors.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">12. Limitation of Liability in Decentralized Environments</h2>
              <p>Due to the decentralized and permissionless nature of blockchain:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SenseiFi does not control third-party smart contracts, tokens, or protocols</li>
                <li>Users remain responsible for their transaction decisions</li>
                <li>Security insights provided are advisory and not guarantees</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">13. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Updates will be reflected by revising the &quot;Last Updated&quot; date.
              </p>
              <p>Continued use of the Services constitutes acceptance of the revised policy.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl text-white font-normal mt-10">14. Contact Us</h2>
              <p>For questions, concerns, or data requests:</p>
              <p>
                <strong>SenseiFi Legal &amp; Compliance Team</strong>
                <br />
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-300 hover:text-blue-200 underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
                <br />
                Website:{" "}
                <a
                  href={WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 underline underline-offset-2"
                >
                  {WEBSITE_URL}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
