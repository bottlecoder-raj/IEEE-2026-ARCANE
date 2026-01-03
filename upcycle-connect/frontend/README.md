# UpCycle Connect Frontend

React.js frontend application for UpCycle Connect platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the frontend directory (optional):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Troubleshooting

### Frontend not starting
- Make sure you've run `npm install` in the frontend directory
- Check that Node.js version is 16+ 
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### API Connection Errors
- The frontend will work even if the backend is not running
- You'll see warnings in the console about API calls failing
- This is expected behavior for development

### Common Issues
- **Port 3000 already in use**: Change the port in `vite.config.js`
- **Module not found errors**: Run `npm install` again
- **Blank page**: Check browser console for errors

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

