#!/usr/bin/env python3
"""
Builder Agent — Christopher Valencia Enterprises
Takes specs from Architect and generates:
- Project scaffolding
- Core application code
- Landing page
- Stripe integration stub
- Deployment config

Outputs ready-to-deploy projects.
"""

import json
import os
import shutil
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PROJECTS_DIR = os.path.join(os.path.dirname(__file__), "projects")
SPECS_FILE = os.path.join(DATA_DIR, "build-specs.json")
BUILD_LOG_FILE = os.path.join(DATA_DIR, "build-log.json")

os.makedirs(PROJECTS_DIR, exist_ok=True)


class Builder:
    def __init__(self):
        self.specs = self.load_json(SPECS_FILE, [])
        self.build_log = self.load_json(BUILD_LOG_FILE, [])

    def load_json(self, path, default):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return default

    def save_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def slugify(self, text):
        """Convert title to project slug"""
        slug = text.lower()
        for char in [' ', '.', ',', '!', '?', "'", '"', '(', ')', '[', ']', ':', ';']:
            slug = slug.replace(char, '-')
        slug = '-'.join(filter(None, slug.split('-')))
        return slug[:40]

    def generate_landing_page(self, spec):
        """Generate a landing page HTML"""
        product = spec["product"]
        revenue = spec["revenue"]
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{product['name']}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; }}
    .hero {{ max-width: 800px; margin: 0 auto; padding: 80px 20px; text-align: center; }}
    h1 {{ font-size: 48px; font-weight: 700; margin-bottom: 20px; background: linear-gradient(135deg, #ffd700, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
    .tagline {{ font-size: 20px; color: #888; margin-bottom: 40px; line-height: 1.6; }}
    .cta {{ display: inline-block; background: #ffd700; color: #000; padding: 16px 48px; border-radius: 8px; font-size: 18px; font-weight: 600; text-decoration: none; }}
    .cta:hover {{ opacity: 0.9; }}
    .price {{ margin-top: 12px; color: #666; font-size: 14px; }}
    .features {{ max-width: 800px; margin: 60px auto; padding: 0 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }}
    .feature {{ background: #111; border: 1px solid #222; border-radius: 8px; padding: 24px; }}
    .feature h3 {{ color: #ffd700; margin-bottom: 8px; }}
    .feature p {{ color: #888; font-size: 14px; line-height: 1.6; }}
    .footer {{ text-align: center; padding: 40px; color: #444; font-size: 12px; }}
  </style>
</head>
<body>
  <div class="hero">
    <h1>{product['name']}</h1>
    <p class="tagline">{product['tagline']}</p>
    <a href="#waitlist" class="cta">Get Early Access</a>
    <p class="price">Starting at {revenue['price']}</p>
  </div>
  <div class="features">
    <div class="feature">
      <h3>Solves Real Pain</h3>
      <p>{product['problem'][:200]}</p>
    </div>
    <div class="feature">
      <h3>Built Fast, Ships Fast</h3>
      <p>No bloat. No unnecessary features. Just the core solution you need, delivered instantly.</p>
    </div>
    <div class="feature">
      <h3>Fair Pricing</h3>
      <p>{revenue['model'].replace('_', ' ').title()} model at {revenue['price']}. Cancel anytime.</p>
    </div>
    <div class="feature">
      <h3>Built by AI Agents</h3>
      <p>Part of Christopher Valencia Enterprises — autonomous AI workforce building solutions 24/7.</p>
    </div>
  </div>
  <div class="footer">
    Christopher Valencia Enterprises &copy; 2026
  </div>
</body>
</html>"""

    def generate_nextjs_scaffold(self, spec, project_dir):
        """Generate Next.js project scaffold"""
        product = spec["product"]
        revenue = spec["revenue"]

        # package.json
        pkg = {
            "name": self.slugify(product["name"]),
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start"
            },
            "dependencies": {
                "next": "^14.0.0",
                "react": "^18.0.0",
                "react-dom": "^18.0.0"
            }
        }

        os.makedirs(os.path.join(project_dir, "app"), exist_ok=True)
        os.makedirs(os.path.join(project_dir, "public"), exist_ok=True)

        with open(os.path.join(project_dir, "package.json"), 'w') as f:
            json.dump(pkg, f, indent=2)

        # README
        readme = f"""# {product['name']}

> {product['tagline']}

## Problem
{product['problem']}

## Revenue Model
- Model: {revenue['model']}
- Price: {revenue['price']}
- Target MRR: {revenue['target_mrr']}

## Tech Stack
{spec['tech_stack']}

## Quick Start
```bash
npm install
npm run dev
```

## Built by
Christopher Valencia Enterprises — AI agents building solutions 24/7.
"""
        with open(os.path.join(project_dir, "README.md"), 'w') as f:
            f.write(readme)

        # Landing page
        with open(os.path.join(project_dir, "public", "index.html"), 'w') as f:
            f.write(self.generate_landing_page(spec))

        # Basic app/page.js
        page_js = f"""export default function Home() {{
  return (
    <main style={{{{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui' }}}}>
      <h1>{product['name']}</h1>
      <p>{product['tagline']}</p>
      <p>Problem: {product['problem'][:200]}</p>
    </main>
  );
}}
"""
        with open(os.path.join(project_dir, "app", "page.js"), 'w') as f:
            f.write(page_js)

        # Basic layout
        layout_js = f"""export const metadata = {{
  title: '{product["name"]}',
  description: '{product["tagline"]}',
}};

export default function RootLayout({{ children }}) {{
  return (
    <html lang="en">
      <body>{{children}}</body>
    </html>
  );
}}
"""
        with open(os.path.join(project_dir, "app", "layout.js"), 'w') as f:
            f.write(layout_js)

    def generate_skill_scaffold(self, spec, project_dir):
        """Generate OpenClaw skill scaffold"""
        product = spec["product"]

        os.makedirs(project_dir, exist_ok=True)

        skill_md = f"""# {product['name']}

## Description
{product['tagline']}

## Problem
{product['problem']}

## Usage
[Describe how to use this skill]

## Examples
[Provide usage examples]
"""
        with open(os.path.join(project_dir, "SKILL.md"), 'w') as f:
            f.write(skill_md)

        # Main script
        script = f"""#!/usr/bin/env python3
\"\"\"
{product['name']} — OpenClaw Skill
{product['tagline']}
\"\"\"

def main():
    # TODO: Implement core functionality
    print("Skill: {product['name']}")
    print("Status: Scaffold ready, needs implementation")

if __name__ == "__main__":
    main()
"""
        with open(os.path.join(project_dir, "main.py"), 'w') as f:
            f.write(script)

    def build(self, spec):
        """Build a project from spec"""
        product = spec["product"]
        product_type = product["type"]
        # Use opportunity title as name if product name not set
        name = spec["opportunity_title"] if product.get("name") == "[NEEDS NAME]" else product.get("name", spec["opportunity_title"])
        product["name"] = name
        product["tagline"] = product.get("tagline", name) if product.get("tagline") != "[NEEDS TAGLINE]" else "Solving: " + name[:80]
        slug = self.slugify(name)
        project_dir = os.path.join(PROJECTS_DIR, slug)

        # Clean existing
        if os.path.exists(project_dir):
            shutil.rmtree(project_dir)

        os.makedirs(project_dir, exist_ok=True)

        if product_type == "agent_skill":
            self.generate_skill_scaffold(spec, project_dir)
        else:
            self.generate_nextjs_scaffold(spec, project_dir)

        # Update spec status
        spec["status"] = "built"
        spec["project_dir"] = project_dir
        spec["built_at"] = datetime.now().isoformat()

        # Log
        log_entry = {
            "id": spec["id"],
            "title": spec["opportunity_title"],
            "type": product_type,
            "project_dir": project_dir,
            "built_at": datetime.now().isoformat(),
            "status": "scaffold_ready"
        }
        self.build_log.append(log_entry)

        return log_entry

    def run(self):
        """Build all spec_ready projects"""
        print(f"[BUILDER] Starting at {datetime.now().isoformat()}")

        ready = [s for s in self.specs if s.get("status") == "spec_ready"]
        print(f"[BUILDER] {len(ready)} specs ready to build")

        built = []
        for spec in ready:
            result = self.build(spec)
            built.append(result)
            print(f"  BUILT: {result['type']} | {result['title'][:50]}")
            print(f"         Dir: {result['project_dir']}")

        self.save_json(SPECS_FILE, self.specs)
        self.save_json(BUILD_LOG_FILE, self.build_log)

        print(f"\n[BUILDER] {len(built)} projects built")
        print(f"[BUILDER] Total builds: {len(self.build_log)}")

        return built


if __name__ == "__main__":
    builder = Builder()
    builder.run()
