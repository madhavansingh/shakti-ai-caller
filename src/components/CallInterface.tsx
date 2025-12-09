import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, PhoneOff, Mic, MicOff, PhoneCall } from "lucide-react";
import VoiceVisualizer from "./VoiceVisualizer";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type CallStatus = "idle" | "connecting" | "connected" | "ended" | "calling";
type CallMode = "web" | "phone";

// Agent ID - Update this with your actual Retell agent ID
const AGENT_ID = "agent_46dc0c6e9ac1a9e79a6b8e0131";

const CallInterface = () => {
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callMode, setCallMode] = useState<CallMode>("web");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("+916264638602");
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

  const startWebCall = async () => {
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

      // Call our backend edge function
      console.log("Calling edge function to create web call...");
      const { data, error } = await supabase.functions.invoke('retell-call', {
        body: { 
          action: 'create-web-call',
          agent_id: AGENT_ID 
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to create web call");
      }

      if (data.error) {
        console.error("Retell API error:", data.error);
        throw new Error(data.error);
      }

      console.log("Web call created:", data);

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

  const startPhoneCall = async () => {
    try {
      setCallStatus("calling");

      console.log("Calling edge function to create phone call...");
      const { data, error } = await supabase.functions.invoke('retell-call', {
        body: { 
          action: 'create-phone-call',
          agent_id: AGENT_ID,
          phone_number: phoneNumber
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to create phone call");
      }

      if (data.error) {
        console.error("Retell API error:", data.error);
        throw new Error(data.error);
      }

      console.log("Phone call created:", data);

      toast({
        title: "Call Initiated",
        description: `Calling ${phoneNumber}...`,
      });

      startTimer();
      setCallStatus("connected");

    } catch (error) {
      console.error("Error starting phone call:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start phone call",
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
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 rounded-lg bg-secondary">
        <button
          onClick={() => setCallMode("web")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            callMode === "web" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Web Call
        </button>
        <button
          onClick={() => setCallMode("phone")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            callMode === "phone" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Phone Call
        </button>
      </div>

      {/* Phone number input for phone calls */}
      {callMode === "phone" && callStatus === "idle" && (
        <div className="w-full max-w-xs">
          <Input
            type="tel"
            placeholder="+91 6264638602"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="text-center text-lg bg-secondary border-border"
          />
        </div>
      )}

      {/* Ripple effects when calling */}
      {(callStatus === "connected" || callStatus === "calling") && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-40 h-40 rounded-full border border-primary/30 animate-ripple" />
          <div className="absolute w-40 h-40 rounded-full border border-primary/30 animate-ripple-delayed" />
          <div className="absolute w-40 h-40 rounded-full border border-primary/30 animate-ripple-delayed-2" />
        </div>
      )}

      {/* Main call button */}
      <div className="relative">
        <Button
          variant={callStatus === "connected" || callStatus === "calling" ? "call-end" : "call"}
          size="icon-xl"
          onClick={() => {
            if (callStatus === "connected" || callStatus === "calling") {
              endCall();
            } else {
              callMode === "web" ? startWebCall() : startPhoneCall();
            }
          }}
          disabled={callStatus === "connecting"}
          className={cn(
            callStatus === "connecting" && "opacity-70 cursor-wait"
          )}
        >
          {callStatus === "connected" || callStatus === "calling" ? (
            <PhoneOff className="w-8 h-8" />
          ) : callMode === "phone" ? (
            <PhoneCall className="w-8 h-8" />
          ) : (
            <Phone className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className={cn(
          "text-lg font-medium",
          (callStatus === "connected" || callStatus === "calling") && "text-primary",
          callStatus === "connecting" && "text-muted-foreground animate-pulse"
        )}>
          {callStatus === "idle" && (callMode === "web" ? "Tap to call Shakti AI" : "Tap to initiate phone call")}
          {callStatus === "connecting" && "Connecting..."}
          {callStatus === "calling" && `Calling ${phoneNumber}...`}
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
      {callMode === "web" && (
        <VoiceVisualizer 
          isActive={callStatus === "connected" && !isMuted} 
          className="h-12"
        />
      )}

      {/* Mute button */}
      {callStatus === "connected" && callMode === "web" && (
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
