import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Zap, X } from "lucide-react";

export default function ComposeForm({ onSubmit, isSubmitting, isIncognitoMode }) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim().length < 10) return;
    
    onSubmit({
      content: content.trim(),
      tags: tags,
    });
  };

  return (
    <div className="p-6">
      <Card className="glass-effect fun-shadow rounded-3xl border-purple-300/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{isIncognitoMode ? '🔥' : '✨'}</span>
              <span className="text-xl glow-text">
                {isIncognitoMode ? 'Incognito Post' : 'Positive Vibe'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Textarea
                placeholder={isIncognitoMode 
                  ? "What's really on your mind? Let it all out... Posts are not moderated." 
                  : "Share something positive, encouraging, or inspiring... Posts are reviewed for kindness."
                }
                value={content}
                onChange={handleContentChange}
                className="min-h-32 resize-none glass-effect border-purple-300/30 focus:border-purple-400 rounded-2xl text-lg"
              />
              <div className="flex justify-between text-sm">
                <span style={{color: 'var(--text-secondary)'}}>
                  {isIncognitoMode 
                    ? 'Express yourself freely (but respectfully)' 
                    : 'Be kind and supportive!'
                  }
                </span>
                <span className={`${charCount > maxChars * 0.8 ? 'text-orange-500' : 'var(--text-secondary)'}`}>
                  {charCount}/{maxChars}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags (optional) 🏷️"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="glass-effect border-purple-300/30 focus:border-purple-400 rounded-2xl"
                  disabled={tags.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!currentTag.trim() || tags.length >= 5}
                  className="rounded-2xl border-purple-300/30 hover:bg-purple-500/10"
                >
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} className="bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 rounded-full">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={content.trim().length < 10 || isSubmitting}
              className={`w-full py-3 rounded-2xl font-medium text-lg transition-all fun-shadow ${
                isIncognitoMode
                  ? 'bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:from-red-600 hover:via-pink-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {isIncognitoMode ? 'Unleashing...' : 'Spreading vibes...'}
                </>
              ) : (
                <>
                  {isIncognitoMode ? <Zap className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  {isIncognitoMode ? 'Unleash Thoughts' : 'Share the Love'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}