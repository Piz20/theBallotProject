"use client";

import * as React from "react";
import { Upload, Link as LinkIcon, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onChange: (image: { type: "file" | "url"; value: File | string }) => void;
  value?: { type: "file" | "url"; value: File | string };
}

export function ImageUploader({ onChange, value }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = React.useState<string>(value?.type || "file");
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [urlInput, setUrlInput] = React.useState<string>(
    value?.type === "url" ? (value.value as string) : ""
  );
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value?.type === "file" && value.value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(value.value);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onChange({ type: "file", value: file });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      onChange({ type: "file", value: file });
      e.dataTransfer.clearData();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange({ type: "url", value: urlInput });
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUrlSubmit();
    }
  };

  const handleRemoveImage = () => {
    setFilePreview(null);
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange({ type: activeTab as "file" | "url", value: "" as any });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="mr-2 h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="pt-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              !filePreview && "hover:bg-muted/50 cursor-pointer",
              isDragging && "bg-muted/70 border-primary"
            )}
            onClick={() => !filePreview && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {!filePreview ? (
              <div className="flex flex-col items-center justify-center h-40">
                <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                <Label className="text-sm font-medium mb-1">
                  Cliquez ou glissez une image
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou GIF (max. 2MB)
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={filePreview}
                  alt="Aperçu de l'image"
                  className="max-h-[300px] max-w-full mx-auto rounded-md object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={handleUrlChange}
                onKeyDown={handleUrlKeyDown}
              />
              <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                Valider
              </Button>
            </div>

            {value?.type === "url" && value.value && (
              <div className="relative mt-4">
                <img
                  src={value.value as string}
                  alt="Image de l'élection"
                  className="max-h-[300px] max-w-full mx-auto rounded-md object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/600x400?text=Image+non+trouvée";
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
