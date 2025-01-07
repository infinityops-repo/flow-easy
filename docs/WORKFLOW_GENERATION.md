# Workflow Generation System Documentation

## Overview
The Workflow Generation System is an AI-powered solution that automatically creates professional workflows for both Make (formerly Integromat) and n8n platforms. It uses advanced prompts and the OpenAI GPT-4 model to generate contextually aware, efficient, and reliable automation workflows.

## Architecture

### Core Components

1. **Prompt Builder**
   - `buildMakePrompt`: Generates Make-specific workflows
   - `buildN8nPrompt`: Generates n8n-specific workflows
   - Located in: `/supabase/functions/generate-workflow/promptBuilder.ts`

2. **Edge Function**
   - Deployed on Supabase
   - Handles API requests and workflow generation
   - Located in: `/supabase/functions/generate-workflow/index.ts`

## How It Works

### 1. User Input Processing
- User provides a natural language description of the desired workflow
- The system analyzes the requirements and context
- Platform-specific prompts are generated based on the target platform (Make or n8n)

### 2. Workflow Generation

#### Make Workflows
The system generates Make scenarios with:
- Appropriate module selection
- Proper data mapping
- Error handling
- Security considerations
- Performance optimizations

Example Make workflow structure:
```json
{
  "name": "Workflow Name",
  "modules": [
    {
      "name": "Module Name",
      "type": "app:module-type",
      "parameters": {},
      "mapping": {},
      "metadata": {
        "notes": "",
        "retries": {}
      }
    }
  ],
  "connections": [],
  "settings": {}
}
```

#### n8n Workflows
The system generates n8n workflows with:
- Node selection and configuration
- Data flow management
- Error handling
- Credentials management
- Performance settings

Example n8n workflow structure:
```json
{
  "nodes": [
    {
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "parameters": {},
      "position": [],
      "notes": ""
    }
  ],
  "connections": {},
  "settings": {}
}
```

### 3. Capabilities

#### Module Categories
1. **Triggers & Inputs**
   - Webhooks
   - Scheduled triggers
   - Database monitors
   - Custom API endpoints

2. **Data Operations**
   - JSON/XML processing
   - Text manipulation
   - Array operations
   - Data transformation

3. **Communication & Messaging**
   - Email integration
   - Chat platforms
   - SMS/Voice services
   - Push notifications

4. **Cloud Services**
   - Google Workspace
   - Microsoft 365
   - AWS services
   - Cloud storage

5. **Business Tools**
   - CRM systems
   - Project management
   - Customer support
   - Analytics

6. **Development & APIs**
   - HTTP requests
   - Database operations
   - Custom integrations
   - Authentication

## Best Practices

### 1. Module/Node Selection
- Use native integrations when available
- Choose specialized modules over generic ones
- Consider rate limits and quotas
- Implement proper authentication
- Match module types to task requirements
- Consider platform-specific features

### 2. Data Flow & Transformation
- Always include proper data mapping between nodes
- Format messages before sending to chat platforms
- Handle API responses appropriately
- Use type-specific formatters (JSON, Text, etc.)
- Ensure consistent data structure
- Validate data before processing

### 3. Error Handling & Reliability
- Configure retry mechanisms for network operations
- Add error notifications for critical failures
- Implement validation filters
- Use try-catch patterns
- Set appropriate timeouts
- Monitor execution status

### 4. Security & Authentication
- Use credential management
- Configure proper connection settings
- Never hardcode sensitive data
- Follow least privilege principle
- Validate inputs
- Secure API endpoints

### 5. Performance & Optimization
- Optimize data flow sequence
- Use batch operations when possible
- Configure appropriate timeouts
- Consider rate limiting
- Optimize resource usage
- Monitor execution time

### 6. Messaging & Communication
- Include proper connection configuration
- Specify connection names explicitly
- Use consistent message formatting
- Handle platform-specific features
- Configure proper retries
- Add error notifications

## Example Workflows

### Make (Integromat) Example

```json
{
  "name": "Currency Rate Updates",
  "modules": [
    {
      "name": "HTTP Request",
      "type": "http:make-request",
      "parameters": {
        "url": "https://api.exchangerate-api.com/v4/latest/USD",
        "method": "GET",
        "timeout": "30000",
        "parseResponse": true
      },
      "metadata": {
        "notes": "Fetches current USD exchange rate",
        "retries": {
          "enabled": true,
          "maxAttempts": 3,
          "delay": 1000
        }
      }
    },
    {
      "name": "Format Message",
      "type": "tools:formatter",
      "parameters": {
        "template": "Current USD rate: {{1.data.rates.BRL}}"
      }
    },
    {
      "name": "Send to Discord",
      "type": "discord:create-message",
      "parameters": {
        "connection": "Discord Bot",
        "channel": "updates",
        "message": "{{2.text}}"
      }
    },
    {
      "name": "Send to Telegram",
      "type": "telegram:send-message",
      "parameters": {
        "connection": "Telegram Bot",
        "chatId": "{{config.telegramChatId}}",
        "message": "{{2.text}}"
      }
    }
  ]
}
```

### n8n Example

```json
{
  "nodes": [
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.exchangerate-api.com/v4/latest/USD",
        "method": "GET",
        "authentication": "none"
      },
      "position": [250, 300]
    },
    {
      "name": "Set Message",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "message",
              "value": "=Current USD rate: {{ $json.rates.BRL }}"
            }
          ]
        }
      }
    },
    {
      "name": "Discord",
      "type": "n8n-nodes-base.discord",
      "parameters": {
        "authentication": "oAuth2",
        "resource": "message",
        "channel": "updates",
        "message": "={{ $node[\"Set Message\"].json[\"message\"] }}"
      },
      "credentials": {
        "discordOAuth2Api": {
          "id": "1",
          "name": "Discord account"
        }
      }
    },
    {
      "name": "Telegram",
      "type": "n8n-nodes-base.telegram",
      "parameters": {
        "authentication": "chatId",
        "chatId": "={{ $credentials.telegramApi.chatId }}",
        "text": "={{ $node[\"Set Message\"].json[\"message\"] }}"
      },
      "credentials": {
        "telegramApi": {
          "id": "2",
          "name": "Telegram account"
        }
      }
    }
  ]
}
```

## Platform-Specific Guidelines

### Make (Integromat)
1. **Module Configuration**
   - Use proper module types (e.g., `http:make-request`, `discord:create-message`)
   - Configure timeouts and retries
   - Set up error handling
   - Use proper data mapping

2. **Data Mapping**
   - Use double curly braces for mappings (`{{1.data}}`)
   - Reference modules by number
   - Include proper error handling
   - Format data appropriately

3. **Connections**
   - Specify connection names
   - Configure authentication
   - Set up webhooks properly
   - Handle rate limits

### n8n
1. **Node Configuration**
   - Use proper node types (e.g., `n8n-nodes-base.httpRequest`)
   - Configure credentials
   - Set up error handling
   - Position nodes logically

2. **Data Mapping**
   - Use expression syntax (`={{ $node["NodeName"].json["field"] }}`)
   - Reference nodes by name
   - Include proper error handling
   - Format data appropriately

3. **Credentials**
   - Configure authentication
   - Use credential store
   - Handle API tokens
   - Secure sensitive data

## Usage Example

```typescript
// Generate a Make workflow
const makeWorkflow = await generateWorkflow({
  description: "Get currency rates and send to chat",
  platform: "make"
});

// Generate an n8n workflow
const n8nWorkflow = await generateWorkflow({
  description: "Sync CRM data with spreadsheet",
  platform: "n8n"
});
```

## Environment Setup

### Requirements
- Supabase project
- OpenAI API key
- Node.js environment

### Configuration
1. Set environment variables in Supabase:
   ```bash
   OPENAI_API_KEY=your_api_key
   ```

2. Deploy the edge function:
   ```bash
   supabase functions deploy generate-workflow
   ```

## Error Handling

The system implements robust error handling:
1. Input validation
2. API error handling
3. Rate limit management
4. Timeout handling

## Maintenance

### Regular Updates
- Keep prompts updated with new features
- Monitor API changes
- Update example workflows
- Optimize performance

### Monitoring
- Track API usage
- Monitor error rates
- Check response times
- Analyze workflow success rates

## Future Improvements

1. **Enhanced Capabilities**
   - Support for more platforms
   - Advanced error prediction
   - Smart optimization suggestions
   - Custom module recommendations

2. **AI Improvements**
   - Context-aware suggestions
   - Learning from user feedback
   - Performance optimization
   - Security enhancement

## Support

For issues and support:
1. Check the error logs
2. Review the documentation
3. Contact the development team
4. Submit feature requests

## Contributing

To contribute to the project:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Follow coding standards

## License

This project is licensed under the MIT License - see the LICENSE file for details.
