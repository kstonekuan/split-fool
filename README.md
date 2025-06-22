# SplitFool

An open source and minimalistic alternative to SplitWise. This tool provides basic functionalities for groups to track and simplify expenses without the complexity of user accounts or payment integrations.

Groups are managed by simple 6-character codes - no login required. Anyone with the code can manage the group's expenses and members.

## Quick Start with Docker

The easiest way to run SplitFool is with Docker:

```bash
# Development mode with hot reload
make dev

# Production mode
docker-compose up --build

# View available commands
make help
```

See [DOCKER.md](./DOCKER.md) for detailed Docker setup instructions.

## Architecture

### Frontend Implementation
The web frontend in `packages/web/` is built with:
- **Svelte**: Reactive UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Cloudflare Pages**: Free hosting with global CDN

### API Implementation
The API in `packages/api/` is built with:
- **Hono**: Lightweight web framework
- **ElectroDB**: Type-safe DynamoDB client
- **Zod**: Runtime validation
- **DynamoDB**: Exclusive database for all environments

### Local Development with Docker
- **DynamoDB Local**: Full AWS DynamoDB compatibility
- **Hot Reload**: Automatic restart on code changes
- **Web Frontend**: http://localhost:5173
- **API**: http://localhost:3000

### AWS Lambda Deployment
- **Lambda Functions**: API endpoints with automatic scaling
- **DynamoDB**: NoSQL database with single-table design
- **API Gateway**: RESTful API management
- **EventBridge**: Scheduled cleanup of old groups
- Deploy with SAM: `./packages/api/scripts/deploy-aws.sh`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Extensions

After the basic functionalities are complete I want to add an alternative LLM-powered chat interface that will allow full control of the group as described above through natural language. This makes expenses described in group chats very easy to import via copy paste or even screenshots. This will make use of Gemini's free tier, in particular Gemini 2.5 Flash (gemini-2.5-flash) which is multimodal.

Some examples:
    - Import group members from a screenshot of group chat members
    - Add expense from a receipt
    - Add expenses from chat messages
    - Rebalance simplification to change who needs to pay who

https://ai.google.dev/gemini-api/docs/models