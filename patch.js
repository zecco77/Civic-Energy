const fs = require('fs');

const landingPage = fs.readFileSync('./src/components/LandingPage.tsx', 'utf8');
let waitlistPage = fs.readFileSync('./src/components/WaitlistPage.tsx', 'utf8');

waitlistPage = waitlistPage.replace('import { useNavigate } from "react-router-dom";', 'import { useNavigate, Link } from "react-router-dom";\nimport { useEffect } from "react";');

const featuresMatch = landingPage.match(/const FEATURES = \[\s*[\s\S]*?\];/);
if (featuresMatch) {
  waitlistPage = waitlistPage.replace('export function WaitlistPage', featuresMatch[0] + '\n\nexport function WaitlistPage');
}

const stateToAdd = `  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);`;
waitlistPage = waitlistPage.replace('const [submitted, setSubmitted] = useState(false);', 'const [submitted, setSubmitted] = useState(false);\n' + stateToAdd);

waitlistPage = waitlistPage.replace('className="min-h-[calc(100vh-4rem)] bg-bg flex flex-col items-center justify-center py-12 relative overflow-hidden"', 'className="min-h-screen bg-bg text-primary"');

const heroPattern = /\{\/\* Background elements matched from LandingPage \*\/\}[\s\S]*?<\/main>/;
const heroMatch = waitlistPage.match(heroPattern);

if (heroMatch) {
    const heroSection = `      <section className="relative min-h-[90vh] flex flex-col items-center justify-start overflow-hidden pt-32 pb-20 bg-bg">\n  ${heroMatch[0]}\n      </section>`;
    waitlistPage = waitlistPage.replace(heroMatch[0], heroSection);
}

const sectionsPattern = /\{\/\* Stats Section \*\/\}[\s\S]*?\{\/\* Footer CTA \*\/\}[\s\S]*?<\/section>/;
const sectionsMatch = landingPage.match(sectionsPattern);

if (sectionsMatch) {
    waitlistPage = waitlistPage.replace('</section>\n    </div>', '</section>\n\n      ' + sectionsMatch[0] + '\n    </div>');
} else {
    console.error("Sections not found in LandingPage");
}

fs.writeFileSync('./src/components/WaitlistPage.tsx', waitlistPage);
console.log("Done");
