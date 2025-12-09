import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import VoiceVisualizer from "./VoiceVisualizer";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type CallStatus = "idle" | "connecting" | "connected" | "ended";

const RETELL_API_KEY = "key_49aaed0f538a2aaa06459160c17d";

const CallInterface = () => {
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const retellClientRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCall = async () => {
    try {
      setCallStatus("connecting");
      setTranscript([]);
      setCallDuration(0);

      // Dynamically import Retell SDK
      const { RetellWebClient } = await import("retell-client-js-sdk");
      
      const retellClient = new RetellWebClient();
      retellClientRef.current = retellClient;

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Register call with Retell API
      const response = await fetch("https://api.retellai.com/v2/create-web-call", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: "agent_46dc0c6e9ac1a9e79a6b8e0131",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create web call");
      }

      const data = await response.json();

      // Set up event listeners
      retellClient.on("call_started", () => {
        console.log("Call started");
        setCallStatus("connected");
        startTimer();
        toast({
          title: "Call Connected",
          description: "You're now connected with Shakti AI",
        });
      });

      retellClient.on("call_ended", () => {
        console.log("Call ended");
        setCallStatus("ended");
        stopTimer();
        toast({
          title: "Call Ended",
          description: `Call duration: ${formatDuration(callDuration)}`,
        });
        setTimeout(() => setCallStatus("idle"), 2000);
      });

      retellClient.on("update", (update: any) => {
        if (update.transcript) {
          setTranscript(update.transcript);
        }
      });

      retellClient.on("error", (error: any) => {
        console.error("Retell error:", error);
        toast({
          title: "Error",
          description: "Something went wrong with the call",
          variant: "destructive",
        });
        setCallStatus("idle");
        stopTimer();
      });

      // Start the call
      await retellClient.startCall({
        accessToken: data.access_token,
      });

    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start call",
        variant: "destructive",
      });
      setCallStatus("idle");
    }
  };

  const endCall = async () => {
    try {
      if (retellClientRef.current) {
        await retellClientRef.current.stopCall();
        retellClientRef.current = null;
      }
      stopTimer();
      setCallStatus("ended");
      setTimeout(() => setCallStatus("idle"), 2000);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const toggleMute = () => {
    if (retellClientRef.current) {
      if (isMuted) {
        retellClientRef.current.unmute();
      } else {
        retellClientRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }
    };
  }, [stopTimer]);

  return (
    <div className="relative flex flex-col items-center gap-8">
      {/* Ripple effects when calling */}
      {callStatus === "connected" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-40 h-40 rounded-full border border-primary/30 animate-ripple" />
          <div className="absolute w-40 h-40 rounded-full border border-primary/30 animate-ripple-delayed" />
          <div className="absolute w-40 h-40 rounded-full border border-primary/30 animate-ripple-delayed-2" />
        </div>
      )}

      {/* Main call button */}
      <div className="relative">
        <Button
          variant={callStatus === "connected" ? "call-end" : "call"}
          size="icon-xl"
          onClick={callStatus === "connected" ? endCall : startCall}
          disabled={callStatus === "connecting"}
          className={cn(
            callStatus === "connecting" && "opacity-70 cursor-wait"
          )}
        >
          {callStatus === "connected" ? (
            <PhoneOff className="w-8 h-8" />
          ) : (
            <Phone className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className={cn(
          "text-lg font-medium",
          callStatus === "connected" && "text-primary",
          callStatus === "connecting" && "text-muted-foreground animate-pulse"
        )}>
          {callStatus === "idle" && "Tap to call Shakti AI"}
          {callStatus === "connecting" && "Connecting..."}
          {callStatus === "connected" && formatDuration(callDuration)}
          {callStatus === "ended" && "Call ended"}
        </p>
        {callStatus === "connected" && (
          <p className="text-sm text-muted-foreground mt-1">
            Connected with Anshika
          </p>
        )}
      </div>

      {/* Voice visualizer */}
      <VoiceVisualizer 
        isActive={callStatus === "connected" && !isMuted} 
        className="h-12"
      />

      {/* Mute button */}
      {callStatus === "connected" && (
        <Button
          variant="outline"
          size="icon-lg"
          onClick={toggleMute}
          className={cn(
            "rounded-full transition-all",
            isMuted && "bg-destructive/20 border-destructive text-destructive"
          )}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
      )}

      {/* Live transcript */}
      {transcript.length > 0 && (
        <div className="w-full max-w-md glass rounded-xl p-4 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Live Transcript
          </h4>
          <div className="space-y-2">
            {transcript.slice(-5).map((item, i) => (
              <p key={i} className={cn(
                "text-sm",
                item.role === "agent" ? "text-primary" : "text-foreground"
              )}>
                <span className="font-medium">
                  {item.role === "agent" ? "Anshika: " : "You: "}
                </span>
                {item.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallInterface;
