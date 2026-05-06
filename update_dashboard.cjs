const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Add lock icons to tabs
const tabsToLock = ['diagnostics', 'decisions', 'contractors', 'tracking', 'map', 'ai'];

tabsToLock.forEach(tab => {
    let oldClassStr;
    const isFlex = tab === 'contractors' || tab === 'tracking' || tab === 'map' || tab === 'ai';
    
    if (tab === 'ai') {
        const aiMatch = code.match(/onClick=\{\(\) => setActiveTab\('ai'\)\}[\s\S]*?Summary\s*<\/button>/);
        if (aiMatch) {
            code = code.replace(aiMatch[0], aiMatch[0].replace('<Sparkles className="w-4 h-4 text-blue-500" />', '<Lock className="w-4 h-4 text-blue-500" />'));
        }
        return;
    }
    
    const tabNameMatch = {
        'diagnostics': 'Diagnostics',
        'decisions': 'Action Plan',
        'contractors': 'Contractor Bids',
        'tracking': 'Savings Tracking',
        'map': 'Neighbour Comparison'
    }[tab];

    const matchRe = new RegExp(`onClick=\\{\\(\\) => setActiveTab\\('${tab}'\\)\\}[\\s\\S]*?${tabNameMatch}\\s*<\\/button>`);
    const match = code.match(matchRe);
    if(match) {
        if (!isFlex && !match[0].includes('flex items-center gap-1.5')) {
           code = code.replace(match[0], match[0].replace('whitespace-nowrap"', 'whitespace-nowrap flex items-center gap-1.5"').replace(`\n                  ${tabNameMatch}`, `\n                  <Lock className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary/60" />\n                  ${tabNameMatch}`));
        } else {
           code = code.replace(match[0], match[0].replace(`\n                  ${tabNameMatch}`, `\n                  <Lock className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary/60" />\n                  ${tabNameMatch}`));
        }
    }
});

// Wrap content
const startMapIndex = code.indexOf("{activeTab === 'map' && (");
const endSectionIndex = code.indexOf("</section>\n\n        {/* Trust and Transparency Footer */}");

if (startMapIndex !== -1 && endSectionIndex !== -1) {
    const wrappedContent = `
          {/* We wrap everything inside a relative container */}
          <div className="relative w-full">
             {activeTab !== 'loss' && (
                <div className="absolute inset-0 z-50 flex items-start justify-center pt-32 pointer-events-auto">
                  <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center flex flex-col items-center border border-black/5 mx-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-50" />
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6 relative z-10 border border-primary/10">
                      <Lock className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-2xl font-semibold text-primary tracking-tight mb-2 relative z-10">Premium Feature Locked</h3>
                    <p className="text-primary/60 mb-8 relative z-10">Join the waitlist for exclusive early access to diagnostics, personalized action plans, and contractor bidding.</p>
                    <button onClick={() => navigate('/')} className="bg-primary hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition-colors w-full relative z-10 shadow-sm">Join the Waitlist</button>
                  </div>
                </div>
             )}
             <div className={cn("w-full transition-all duration-500", activeTab !== 'loss' && "filter blur-md opacity-40 pointer-events-none select-none")}>
${code.substring(startMapIndex, endSectionIndex)}
             </div>
          </div>
`;
    code = code.substring(0, startMapIndex) + wrappedContent + code.substring(endSectionIndex);
}

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Dashboard UI updated");
