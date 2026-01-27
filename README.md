<div align="center">

# 👨‍💻 IAmHere

### A Terminal-Inspired Developer Portfolio Experience

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://i-am-here-six.vercel.app)

<img src="https://raw.githubusercontent.com/asissharma/IAmHere/main/public/profile.png" alt="IAmHere Hero" width="200">

**[Live Demo](https://i-am-here-six.vercel.app)** • **[Report Bug](https://github.com/asissharma/IAmHere/issues)** • **[Request Feature](https://github.com/asissharma/IAmHere/issues)**

</div>

---

## 📝 About the Project

**IAmHere** is a modern, terminal-inspired developer portfolio website that showcases skills, experience, and system architecture philosophy. Built with Next.js and TypeScript, it features a unique "booting system" interface with animated transitions, real-time GitHub activity integration, and a cyberpunk-themed design aesthetic.

The project demonstrates advanced frontend techniques including dark mode toggle, responsive design, animated components, and a clean, maintainable codebase following modern React patterns.

---

## ✨ Key Features

| Feature | Description |
| :----------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Terminal Aesthetic** | Retro-futuristic boot sequence and command-line inspired UI elements |
| **GitHub Integration** | Real-time contribution graph and commit history display |
| **System Architecture** | Interactive architecture showcase with event-driven, reliability, and performance sections |
| **Dark/Light Mode** | Seamless theme switching with persistent user preference |
| **Tech Stack Display** | Animated technology icons showcasing proficiency across multiple stacks |
| **Responsive Design** | Fully optimized for desktop, tablet, and mobile devices |
| **Performance Optimized** | Server-side rendering, code splitting, and optimized assets for sub-100ms TTFB |
| **Type-Safe** | 100% TypeScript coverage ensuring code quality and maintainability |

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

### Backend & APIs

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Next.js API Routes](https://img.shields.io/badge/API%20Routes-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![GitHub API](https://img.shields.io/badge/GitHub%20API-181717?style=flat-square&logo=github&logoColor=white)

### DevOps & Deployment

![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=flat-square&logo=postcss&logoColor=white)

</div>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher)
- **npm** or **yarn** or **pnpm** or **bun**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/asissharma/IAmHere.git
cd IAmHere
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:
```env
# GitHub API Configuration (Optional - for fetching real-time stats)
NEXT_PUBLIC_GITHUB_USERNAME=your_github_username
GITHUB_ACCESS_TOKEN=your_github_personal_access_token

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📂 Project Structure
```
IAmHere/
├── pages/                  # Next.js pages and API routes
│   ├── _app.tsx           # Application wrapper
│   ├── index.tsx          # Main landing page
│   └── api/               # API endpoints
├── public/                # Static assets
│   ├── profile.png        # Profile image
│   └── positive_mountains.png  # Hero background
├── styles/                # Global styles and Tailwind config
│   └── globals.css        # Global CSS with custom animations
├── lib/                   # Utility functions and helpers
├── components/            # Reusable React components (if any)
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

---

## 💻 Usage Examples

### Customizing Content

1. **Update Profile Information**: Edit `pages/index.tsx` to modify personal details, bio, and tech stack icons
2. **Change Theme Colors**: Modify `tailwind.config.ts` to adjust the color palette
3. **Add New Sections**: Create new components in `pages/index.tsx` or extract to separate files in `components/`

### Fetching Real GitHub Stats

The application can integrate with GitHub's API to display real contribution data:
```typescript
// Example: Fetch GitHub contributions
const response = await fetch(
  `https://api.github.com/users/${username}/events/public`
);
const events = await response.json();
```

### Deploying to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

---

## 🗺️ Roadmap

- [x] Terminal boot sequence animation
- [x] Dark/Light mode toggle
- [x] Responsive mobile design
- [x] GitHub contribution integration
- [x] Tech stack icon display
- [ ] Blog section with MDX support
- [ ] Project showcase with live demos
- [ ] Contact form with email integration
- [ ] Performance metrics dashboard
- [ ] Internationalization (i18n) support
- [ ] Accessibility (a11y) improvements
- [ ] SEO optimization with metadata

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
```bash
   # Click the "Fork" button at the top right of the repository page
```

2. **Clone Your Fork**
```bash
   git clone https://github.com/your-username/IAmHere.git
   cd IAmHere
```

3. **Create a Feature Branch**
```bash
   git checkout -b feature/AmazingFeature
```

4. **Make Your Changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add comments where necessary

5. **Commit Your Changes**
```bash
   git add .
   git commit -m "feat: Add some AmazingFeature"
```

6. **Push to Your Branch**
```bash
   git push origin feature/AmazingFeature
```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe your changes in detail

### Code Style Guidelines

- Use **TypeScript** for all new files
- Follow **ESLint** and **Prettier** configurations
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Ensure all tests pass before submitting PR

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Kaala Sharma (Asis Sharma)**

- GitHub: [@asissharma](https://github.com/asissharma)
- Portfolio: [i-am-here-six.vercel.app](https://i-am-here-six.vercel.app)
- Email: [Contact via GitHub](https://github.com/asissharma)

---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vercel](https://vercel.com/) - Deployment and hosting platform
- [DevIcons](https://devicon.dev/) - Programming languages and frameworks icons
- [GitHub API](https://docs.github.com/en/rest) - For real-time contribution data

---

<div align="center">

### ⚡ Built with precision. Deployed with confidence.

**[⬆ Back to Top](#-iamhere)**

</div>
