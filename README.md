# Data Alchemist: AI-Powered Resource Allocation Configurator

A Next.js web application that transforms messy spreadsheet data into clean, validated datasets with AI-powered features for data processing, validation, and business rule creation.

## 🚀 Features

### Core Functionality
- **Multi-format Data Upload**: Support for CSV and XLSX files
- **Real-time Data Validation**: Comprehensive validation with immediate feedback
- **Editable Data Grid**: Inline editing with validation highlighting
- **Business Rules Engine**: Create and manage complex business rules
- **Priority & Weight Management**: Configure resource allocation priorities
- **Export Functionality**: Clean CSV files and rules.json export

### 🤖 AI-Powered Features

#### 1. Smart Data Parsing
- **AI Header Mapping**: Automatically maps wrongly named or rearranged columns to correct data structure
- **High Confidence Auto-mapping**: Files with >60% confidence are automatically processed
- **Fallback Manual Mapping**: Lower confidence files show mapping interface for user review

#### 2. Natural Language Data Search
- **Plain English Queries**: Search data using natural language
- **Example queries**: 
  - "high priority clients"
  - "workers with Python skills" 
  - "tasks requiring more than 3 phases"
- **Smart Result Filtering**: AI understands context and filters accordingly

#### 3. AI Validation & Corrections
- **Automated Validation**: AI analyzes data for issues beyond standard validation
- **Smart Corrections**: Suggests specific fixes with confidence levels
- **Real-time Analysis**: Validation runs automatically when data changes

#### 4. Natural Language Rule Creation
- **Rule Converter**: Convert plain English rules to structured rule objects
- **Example inputs**:
  - "Tasks T001 and T002 should always run together"
  - "Sales workers maximum 5 slots per phase"
  - "Engineering group needs at least 3 common slots"

#### 5. AI Rule Recommendations
- **Pattern Detection**: Analyzes data patterns to suggest useful rules
- **Smart Suggestions**: Recommends co-run rules, load limits, and slot restrictions
- **One-click Accept**: Easy integration of AI suggestions

## 📊 Data Entities

### Clients
- ClientID, ClientName, PriorityLevel (1-5)
- RequestedTaskIDs, GroupTag, AttributesJSON

### Workers  
- WorkerID, WorkerName, Skills
- AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel

### Tasks
- TaskID, TaskName, Category, Duration
- RequiredSkills, PreferredPhases, MaxConcurrent

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data Processing**: Papa Parse, XLSX
- **AI Integration**: OpenAI GPT-4o-mini
- **Validation**: Custom validation engine
- **Tables**: TanStack React Table

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd data-alchemist
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env.local file
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/ai/              # AI service API routes
│   │   ├── validate/        # Data validation endpoint
│   │   ├── search/          # Natural language search
│   │   ├── convert-rule/    # Rule conversion
│   │   ├── corrections/     # Data corrections
│   │   ├── recommend-rules/ # Rule recommendations
│   │   └── map-headers/     # Header mapping
│   ├── components/          # React components
│   │   ├── AISearchBox.tsx
│   │   ├── AIRulesConverter.tsx
│   │   ├── AIValidationPanel.tsx
│   │   ├── AIRuleRecommendations.tsx
│   │   ├── EditableTable.tsx
│   │   ├── FileUploader.tsx
│   │   └── RulesEditor.tsx
│   ├── lib/                 # Utility libraries
│   │   ├── aiService.ts     # AI service client
│   │   ├── smartHeaderMapper.ts
│   │   ├── validateData.ts
│   │   └── exportUtils.ts
│   └── page.tsx            # Main application page
├── samples/                # Sample data files
│   ├── clients.csv
│   ├── workers.csv
│   └── tasks.csv
└── types/                  # TypeScript definitions
```

## 🎯 Usage Guide

### 1. Upload Data
- Click "Choose Files" and select CSV/XLSX files
- AI automatically detects and maps data structure
- Review mapping if confidence is low

### 2. Validate & Edit Data
- View validation summary for errors
- Use AI validation for deeper analysis
- Edit data inline with real-time validation
- Get AI correction suggestions

### 3. Search Data
- Use natural language search box
- Try queries like "high priority clients"
- View filtered results with explanations

### 4. Create Rules
- Use AI Rules Converter for natural language input
- Accept AI rule recommendations
- Manually create rules using the UI
- Preview rule effects on data

### 5. Export Results
- Set priorities and weights
- Export clean CSV files
- Download rules.json configuration

## 🔧 API Endpoints

### AI Services
- `POST /api/ai/validate` - Validate data with AI
- `POST /api/ai/search` - Natural language search
- `POST /api/ai/convert-rule` - Convert natural language to rules
- `POST /api/ai/corrections` - Get correction suggestions
- `POST /api/ai/recommend-rules` - Get rule recommendations
- `POST /api/ai/map-headers` - Smart header mapping

## 🎨 AI Prompting Strategy

The application uses carefully crafted prompts to ensure:
- **Consistent JSON responses** for reliable parsing
- **Context-aware analysis** using sample data
- **Confidence scoring** for mapping decisions
- **Fallback mechanisms** when AI is unavailable

## 🧪 Sample Data

The `/samples` directory contains example data files:
- **clients.csv**: 8 sample clients with varying priorities
- **workers.csv**: 10 workers with different skills and availability
- **tasks.csv**: 10 tasks across different categories

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```bash
OPENAI_API_KEY=your_production_api_key
OPENAI_API_BASE=https://api.openai.com/v1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini API
- Next.js team for the excellent framework
- TanStack for React Table
- All open source contributors

---

**Built with ❤️ for the Digitalyz team assignment**
