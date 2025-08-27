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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateFromDescriptionRequest } from "@/types/RequestInterfaces";
import { CreateFromDescriptionRequestSchema } from "@/types/RequestSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { pipeline, read_audio } from "@huggingface/transformers";
import { Languages, Loader2, Mic, MicOff, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  onCreateVM: (data: CreateFromDescriptionRequest) => void;
  isCreating: boolean;
}) {
  const [language, setLanguage] = useState<"en-US" | "fr-FR">("en-US");
  const [isFirefox, setIsFirefox] = useState(false);
  const [isTransformersLoading, setIsTransformersLoading] = useState(false);
  const [transformersListening, setTransformersListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | undefined>(undefined);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const preListenDescriptionRef = useRef<string>("");
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
    defaultValues: {
      description: "",
      vm_name: "",
      timeout: 300,
    },
    mode: "onChange",
  });

  const description = form.watch("description");

  useEffect(() => {
    if (browserSupportsSpeechRecognition && !isFirefox && listening) {
      if (!preListenDescriptionRef.current) {
        preListenDescriptionRef.current = form.getValues("description");
      }
      const base = preListenDescriptionRef.current || "";
      form.setValue(
        "description",
        [base, transcript].filter(Boolean).join(" ").trim(),
        { shouldValidate: true },
      );
    }
  }, [
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    isFirefox,
    form,
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
              const previous = form.getValues("description") || "";
              form.setValue(
                "description",
                [previous, text].filter(Boolean).join(" ").trim(),
                { shouldValidate: true },
              );
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
    form.setValue("description", "", { shouldValidate: true });
    resetTranscript();
  };

  const handleSubmit = (data: CreateFromDescriptionRequest) => {
    const { vm_name, description } = data;
    if (vm_name && description) {
      onCreateVM({ vm_name, description });
    }
  };

  useEffect(() => {
    if (!listening && browserSupportsSpeechRecognition && !isFirefox) {
    } else if (!listening && transcript) {
      preListenDescriptionRef.current = "";
      resetTranscript();
    }
  }, [
    description,
    listening,
    resetTranscript,
    transcript,
    browserSupportsSpeechRecognition,
    isFirefox,
    form,
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
    <div className="p-6 mx-auto max-w-2xl rounded-2xl border shadow-sm bg-background">
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
                className="flex-1 rounded-full transition-none cursor-pointer min-w-[160px]"
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
                  <span className="ml-2 text-base text-left select-none min-w-[110px]">
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
                className="rounded-full cursor-pointer min-w-[80px]"
                disabled={isCreating}
                aria-label={LANG[language].langAria}
              >
                <Languages className="w-5 h-5" />
                <span className="ml-2 font-medium">
                  {LANG[language].langBtn}
                </span>
              </Button>
            </div>
            <Button
              type="button"
              onClick={clearInput}
              variant="ghost"
              className="rounded-full cursor-pointer min-w-[100px]"
              disabled={
                isCreating ||
                listening ||
                transformersListening ||
                isTransformersLoading
              }
            >
              <Trash2 className="w-5 h-5" />
              <span className="ml-2">{LANG[language].clear}</span>
            </Button>
          </div>
          <FormField
            control={form.control}
            name="vm_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VM Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter VM name"
                    className="w-full text-base rounded-full"
                    disabled={isCreating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      className="p-4 w-full text-base rounded-xl border resize-none focus-visible:ring-2 min-h-[140px] focus-visible:ring-ring focus-visible:border-primary"
                      disabled={isCreating}
                    />
                    {((isFirefox && transformersListening) ||
                      (!isFirefox && listening) ||
                      (isFirefox && isTransformersLoading)) && (
                      <div className="absolute right-4 bottom-4 left-4 p-3">
                        <div className="flex items-center">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full animate-bounce bg-primary"></div>
                            <div className="w-2 h-2 rounded-full delay-150 animate-bounce bg-primary"></div>
                            <div className="w-2 h-2 rounded-full delay-300 animate-bounce bg-primary"></div>
                          </div>
                          <span className="ml-2 font-medium text-primary">
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
            <div className="p-4 rounded-lg border bg-muted text-foreground dark:text-foreground">
              <p className="font-medium">{LANG[language].speechNotSupported}</p>
              <p className="mt-1 text-sm">
                {LANG[language].speechNotSupportedDesc}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 justify-between items-center sm:flex-row">
            <div className="text-xs text-muted-foreground">
              {LANG[language].works}
            </div>
            <Button
              type="submit"
              disabled={isCreating || !description.trim()}
              className="py-3 px-6 font-medium rounded-full shadow-sm cursor-pointer hover:shadow-md"
            >
              {isCreating ? (
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              ) : (
                <Send className="mr-2 w-5 h-5" />
              )}
              {LANG[language].submit}
            </Button>
          </div>
        </form>
      </Form>

      <div className="p-4 mt-8 rounded-lg border bg-muted">
        <h3 className="font-medium text-foreground">{LANG[language].howTo}</h3>
        <ul className="pl-5 mt-2 space-y-1 text-sm list-disc text-muted-foreground">
          {LANG[language].howToList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
