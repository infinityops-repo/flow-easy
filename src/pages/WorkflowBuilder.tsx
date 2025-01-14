import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, Loader2, MessageSquare, Plus, Settings, Trash } from "lucide-react"

interface WorkflowTemplate {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const templates: WorkflowTemplate[] = [
  {
    id: "chat",
    title: "Chat",
    description: "Crie um fluxo de conversa interativo",
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    id: "bot",
    title: "Bot",
    description: "Automatize tarefas com um bot inteligente",
    icon: <Bot className="h-6 w-6" />,
  },
]

export default function WorkflowBuilder() {
  const { toast } = useToast()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    toast({
      title: "Template selecionado",
      description: `Você selecionou o template ${templateId}`,
    })
  }

  const handleAddMessage = () => {
    if (!newMessage.trim()) return
    setMessages([...messages, newMessage])
    setNewMessage("")
  }

  const handleDeleteMessage = (index: number) => {
    const newMessages = messages.filter((_, i) => i !== index)
    setMessages(newMessages)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Sucesso!",
        description: "Workflow salvo com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar workflow",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workflow Builder</h1>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Workflow
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Escolha um template para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {template.icon}
                    <span className="ml-2">{template.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Tabs defaultValue="messages">
            <TabsList>
              <TabsTrigger value="messages">Mensagens</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Mensagens</CardTitle>
                  <CardDescription>
                    Adicione as mensagens do seu workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Label htmlFor="message">Nova Mensagem</Label>
                        <Textarea
                          id="message"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                        />
                      </div>
                      <Button
                        className="mt-8"
                        onClick={handleAddMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <ScrollArea className="h-[400px] pr-4">
                      {messages.map((message, index) => (
                        <div key={index}>
                          <div className="flex items-start space-x-2 py-2">
                            <div className="flex-1">
                              <p className="text-sm">{message}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMessage(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          {index < messages.length - 1 && <Separator />}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>
                    Configure as opções do seu workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Workflow</Label>
                      <Input id="name" placeholder="Digite o nome..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Digite a descrição..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 