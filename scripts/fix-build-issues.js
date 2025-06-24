const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing build issues...")

// Ensure all required directories exist
const requiredDirs = ["lib", "components/ui", "app/api", "hooks", "styles"]

requiredDirs.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  }
})

// Check if critical files exist
const criticalFiles = ["lib/utils.ts", "tsconfig.json", "next.config.js", "package.json"]

criticalFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`)
  } else {
    console.log(`❌ Missing: ${file}`)
  }
})

// Verify TypeScript paths
try {
  const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"))
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
    console.log("✅ TypeScript path mapping configured")
  } else {
    console.log("❌ TypeScript path mapping missing")
  }
} catch (error) {
  console.log("❌ Error reading tsconfig.json:", error.message)
}

console.log("🎉 Build issue check complete!")
