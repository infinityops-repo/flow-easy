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
import { Bot, Loader2, MessageSquare, Plus, Trash } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Flow Easy</h1>
              <p className="text-muted-foreground mt-2">Construa seus workflows de forma simples e intuitiva</p>
            </div>
            <Button onClick={handleSave} disabled={isLoading} size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <Card className="glass-card">
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
                        variant={selectedTemplate === template.id ? "default" : "secondary"}
                        className="w-full justify-start gap-3 h-auto py-4"
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        {template.icon}
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{template.title}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-9">
              <Card className="glass-card">
                <CardHeader>
                  <Tabs defaultValue="messages" className="w-full">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="messages" className="flex-1">Mensagens</TabsTrigger>
                      <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="messages" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label htmlFor="message">Nova Mensagem</Label>
                            <Textarea
                              id="message"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Digite sua mensagem..."
                              className="mt-2"
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
                          <div className="space-y-4">
                            {messages.map((message, index) => (
                              <Card key={index} className="bg-card/50">
                                <CardContent className="flex items-start justify-between p-4">
                                  <p className="text-sm flex-1">{message}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteMessage(index)}
                                    className="ml-2 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
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
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 