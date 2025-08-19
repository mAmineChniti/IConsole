"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { CreateFromDescriptionRequest } from "@/types/RequestInterfaces";
import { CreateFromDescriptionRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { pipeline, read_audio } from "@huggingface/transformers";
import { Languages, Loader2, Mic, MicOff, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { toast } from "sonner";

const whisperLanguage = (uiLang: "en-US" | "fr-FR") =>
  uiLang === "fr-FR" ? "french" : "english";

export function DescribeVMTab({
  onCreateVM,
  isCreating,
}: {
  onCreateVM: (description: string) => void;
  isCreating: boolean;
}) {
  const [language, setLanguage] = useState<"en-US" | "fr-FR">("en-US");
  const [isFirefox, setIsFirefox] = useState(false);
  const [isTransformersLoading, setIsTransformersLoading] = useState(false);
  const [transformersListening, setTransformersListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | undefined>(undefined);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const WHISPER_MODEL_ID = "Xenova/whisper-base";

  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const LANG = {
    "en-US": {
      title: "Create VM from Description",
      subtitle:
        "Describe your virtual machine requirements or speak them aloud",
      mic: {
        notSupported: "Speech Not Supported",
        listening: "Listening...",
        start: "Start Speaking",
      },
      langBtn: "EN",
      langAria: "Switch to French",
      clear: "Clear",
      description: "Description",
      placeholder:
        "Describe your VM requirements (e.g., 'I need a Linux VM with 4GB RAM and 2 CPUs')",
      speechNotSupported: "Speech Recognition Not Supported",
      speechNotSupportedDesc:
        "Your browser doesn't support speech recognition. Try Chrome, Edge, or Firefox.",
      works:
        "Works in Chrome, Edge (Chromium), and Firefox (with speech recognition support)",
      submit: "Create Virtual Machine",
      howTo: "How to use:",
      howToList: [
        "Click the microphone button and speak your requirements",
        "Type directly in the text box if you prefer",
        "Switch between English and French using the language button",
        'Press "Create Virtual Machine" when done',
      ],
    },
    "fr-FR": {
      title: "Créer VM à partir de la description",
      subtitle:
        "Décrivez les exigences de votre machine virtuelle ou dites-les à haute voix",
      mic: {
        notSupported: "Parole non prise en charge",
        listening: "Écoute...",
        start: "Commencer à parler",
      },
      langBtn: "FR",
      langAria: "Passer en anglais",
      clear: "Effacer",
      description: "Description",
      placeholder:
        "Décrivez vos besoins en matière de VM (par exemple, 'J'ai besoin d'une VM Linux avec 4 Go de RAM et 2 CPU')",
      speechNotSupported: "Reconnaissance vocale non prise en charge",
      speechNotSupportedDesc:
        "Votre navigateur ne prend pas en charge la reconnaissance vocale. Essayez Chrome, Edge ou Firefox.",
      works:
        "Fonctionne dans Chrome, Edge (Chromium) et Firefox (avec prise en charge de la reconnaissance vocale)",
      submit: "Créer une machine virtuelle",
      howTo: "Comment utiliser :",
      howToList: [
        "Cliquez sur le bouton microphone et dites vos exigences",
        "Écrivez directement dans la zone de texte si vous préférez",
        "Passez de l'anglais au français à l'aide du bouton de langue",
        'Appuyez sur "Créer une machine virtuelle" lorsque vous avez terminé',
      ],
    },
  } as const;

  const form = useForm<CreateFromDescriptionRequest>({
    resolver: zodResolver(CreateFromDescriptionRequestSchema),
    defaultValues: { description: "" },
    mode: "onChange",
  });

  const description = form.watch("description");
  const setDescription = useCallback(
    (val: string) => {
      form.setValue("description", val, { shouldValidate: true });
    },
    [form],
  );

  useEffect(() => {
    if (browserSupportsSpeechRecognition && !isFirefox && listening) {
      setDescription(transcript);
    }
  }, [
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    isFirefox,
    setDescription,
  ]);

  useEffect(() => {
    setIsFirefox(
      typeof window !== "undefined" &&
        navigator.userAgent.toLowerCase().includes("firefox"),
    );
  }, []);

  const isSpeechSupported = browserSupportsSpeechRecognition || isFirefox;

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en-US" ? "fr-FR" : "en-US"));
    resetTranscript();
  };

  const handleMicClick = async () => {
    if (!isSpeechSupported) {
      toast.error("Browser does not support speech recognition");
      return;
    }

    if (browserSupportsSpeechRecognition && !isFirefox) {
      await (!listening
        ? SpeechRecognition.startListening({ continuous: true, language })
        : SpeechRecognition.stopListening());
      return;
    }

    if (!transformersListening) {
      setTransformersListening(true);
      setIsTransformersLoading(false);

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
        mediaRecorderRef.current = undefined;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = undefined;
      }
      audioChunksRef.current = [];

      let pipelineInstance;
      try {
        pipelineInstance = await pipeline(
          "automatic-speech-recognition",
          WHISPER_MODEL_ID,
          {
            dtype: "q8",
            device: "wasm",
          },
        );
      } catch (err) {
        toast.error("Failed to load ASR pipeline");
        console.error("ASR pipeline loading error:", err);
        setIsTransformersLoading(false);
        setTransformersListening(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          setIsTransformersLoading(true);
          setTransformersListening(false);
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          try {
            if (!pipelineInstance)
              throw new Error("ASR pipeline not available");

            const audioFile = new File([audioBlob], "recording.webm", {
              type: "audio/webm",
            });
            const audioUrl = URL.createObjectURL(audioFile);
            let audioArray;
            try {
              audioArray = await read_audio(audioUrl, 16000);
            } finally {
              URL.revokeObjectURL(audioUrl);
            }
            if (!audioArray || audioArray.length === 0) {
              console.error(
                "read_audio returned empty/undefined audioArray:",
                audioArray,
              );
              toast.error("Recorded audio could not be decoded");
              return;
            }
            const output = await pipelineInstance(audioArray, {
              language: whisperLanguage(language),
              task: "transcribe",
              return_timestamps: false,
              chunk_length_s: 60,
              stride_length_s: 10,
            });

            let text = "";
            if (Array.isArray(output)) {
              text = output
                .map((o: { text: string }) => o.text)
                .filter(Boolean)
                .join(" ");
            } else if (
              output &&
              typeof output === "object" &&
              "text" in output
            ) {
              text = (output as { text: string }).text;
            }

            if (text) {
              setDescription((description ? description + " " : "") + text);
            } else {
              toast.error("No text recognized");
            }
          } catch (err) {
            toast.error("Speech recognition failed");
            console.error(err instanceof Error ? err.message : err);
          } finally {
            setIsTransformersLoading(false);
            setTransformersListening(false);

            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = undefined;
            }
          }
        };

        mediaRecorder.start();
      } catch (e) {
        toast.error("Microphone access denied or unavailable");
        console.error("Microphone access error:", e);
        setTransformersListening(false);
        setIsTransformersLoading(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = undefined;
        }
      }
    } else {
      setTransformersListening(false);
      setIsTransformersLoading(true);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      } else {
        setIsTransformersLoading(false);
        setTransformersListening(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = undefined;
        }
      }
    }
  };

  const clearInput = async () => {
    setDescription("");
    resetTranscript();
  };

  const handleSubmit = (values: CreateFromDescriptionRequest) => {
    if (values.description.trim()) {
      onCreateVM(values.description.trim());
    }
  };

  useEffect(() => {
    if (!listening && browserSupportsSpeechRecognition && !isFirefox) {
    } else if (!listening && transcript) {
      setDescription((description ? description + " " : "") + transcript);
      resetTranscript();
    }
  }, [
    description,
    listening,
    resetTranscript,
    setDescription,
    transcript,
    browserSupportsSpeechRecognition,
    isFirefox,
  ]);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = undefined;
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-background p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          {LANG[language].title}
        </h2>
        <p className="mt-2 text-muted-foreground">{LANG[language].subtitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 gap-2">
              <Button
                type="button"
                onClick={handleMicClick}
                variant={
                  listening || transformersListening ? "destructive" : "default"
                }
                className="rounded-full flex-1 min-w-[160px] cursor-pointer transition-none"
                disabled={
                  isCreating ||
                  !isSpeechSupported ||
                  (isFirefox && isTransformersLoading)
                }
                tabIndex={0}
                aria-live="polite"
                aria-busy={
                  listening ||
                  transformersListening ||
                  (isFirefox && isTransformersLoading)
                }
              >
                <span className="flex items-center">
                  <span className="inline-block w-5 h-5 align-middle">
                    {listening || transformersListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </span>
                  <span className="ml-2 text-base min-w-[110px] text-left select-none">
                    {!isSpeechSupported
                      ? LANG[language].mic.notSupported
                      : listening || transformersListening
                        ? LANG[language].mic.listening
                        : LANG[language].mic.start}
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                onClick={toggleLanguage}
                variant="outline"
                className="rounded-full min-w-[80px] cursor-pointer"
                disabled={isCreating}
                aria-label={LANG[language].langAria}
              >
                <Languages className="h-5 w-5" />
                <span className="ml-2 font-medium">
                  {LANG[language].langBtn}
                </span>
              </Button>
            </div>
            <Button
              type="button"
              onClick={clearInput}
              variant="ghost"
              className="rounded-full min-w-[100px] cursor-pointer"
              disabled={
                isCreating ||
                listening ||
                transformersListening ||
                isTransformersLoading
              }
            >
              <Trash2 className="h-5 w-5" />
              <span className="ml-2">{LANG[language].clear}</span>
            </Button>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LANG[language].description}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      {...field}
                      placeholder={LANG[language].placeholder}
                      rows={6}
                      className="resize-none w-full min-h-[140px] text-base p-4 border rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
                      disabled={isCreating}
                    />
                    {((isFirefox && transformersListening) ||
                      (!isFirefox && listening) ||
                      (isFirefox && isTransformersLoading)) && (
                      <div className="absolute bottom-4 left-4 right-4 p-3">
                        <div className="flex items-center">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></div>
                          </div>
                          <span className="ml-2 text-primary font-medium">
                            {isFirefox && isTransformersLoading
                              ? language === "fr-FR"
                                ? "Traitement..."
                                : "Processing..."
                              : LANG[language].mic.listening}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isSpeechSupported && (
            <div className="bg-muted border text-foreground dark:text-foreground p-4 rounded-lg">
              <p className="font-medium">{LANG[language].speechNotSupported}</p>
              <p className="mt-1 text-sm">
                {LANG[language].speechNotSupportedDesc}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-xs text-muted-foreground">
              {LANG[language].works}
            </div>
            <Button
              type="submit"
              disabled={isCreating || !description.trim()}
              className="rounded-full px-6 py-3 font-medium shadow-sm hover:shadow-md cursor-pointer"
            >
              {isCreating ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              {LANG[language].submit}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 rounded-lg border bg-muted p-4">
        <h3 className="font-medium text-foreground">{LANG[language].howTo}</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
          {LANG[language].howToList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
