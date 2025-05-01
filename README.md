# AI Voice Interviewer

## Overview

This project is a web application designed to conduct voice-based interviews using an AI agent. Built with Next.js and leveraging the Vapi SDK for real-time voice communication, it allows users to interact with an AI interviewer, captures the conversation transcript, and can optionally generate feedback based on the interview session.

## Features

*   **Real-time Voice Interaction:** Engages users in a voice conversation with an AI.
*   **AI Speaking Indicator:** Provides visual feedback when the AI agent is speaking.
*   **Live Transcript Display:** Shows the latest recognized speech during the conversation.
*   **Call State Management:** Handles the lifecycle of the call (Inactive, Connecting, Active, Finished).
*   **Interview Modes:** Supports different modes, potentially including generating questions dynamically or using a predefined set.
*   **Transcript Storage & Feedback:** Saves the interview transcript and routes the user to a feedback page upon completion (in specific modes).
*   **Component-Based UI:** Uses React components for displaying user/AI avatars and managing call controls.

## Technology Stack

*   **Frontend:** Next.js, React, TypeScript
*   **Styling:** Tailwind CSS and shadcn
*   **Voice AI:** Vapi SDK
*   **Backend/Actions:** Next.js Server Actions

## Diagrams

### Component Interaction (Class Diagram)

```mermaid
classDiagram
    direction LR

    class User {
        <<Actor>>
        +Interacts with UI
    }

    class AgentComponent {
        <<React Component>>
        +userName: string
        +userId: string
        +interviewId: string
        +feedbackId: string
        +type: string
        +questions: string[]
        -callStatus: CallStatus
        -messages: SavedMessage[]
        -isSpeaking: boolean
        -lastMessage: string
        +handleCall()
        +handleDisconnect()
        +render() UI
        #useEffect() Hooks for Vapi & Feedback
    }

    class VapiSDK {
        <<External Library>>
        +start(assistant, config)
        +stop()
        +on(event, callback)
        +off(event, callback)
        #emits call-start
        #emits call-end
        #emits message
        #emits speech-start
        #emits speech-end
        #emits error
    }

    class CreateFeedbackAction {
        <<Server Action>>
        +createFeedback(data) Promise~Result~
    }

    class NextRouter {
       <<Next.js Service>>
       +push(path)
    }

    User --|> AgentComponent : Interacts via Browser
    AgentComponent ..> VapiSDK : Uses
    AgentComponent ..> CreateFeedbackAction : Calls
    AgentComponent ..> NextRouter : Uses for navigation
```

### Call Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User
    participant AgentComponent as Agent (UI)
    participant VapiSDK as Vapi
    participant NextRouter as Router
    participant ServerAction as createFeedback

    User->>+Agent (UI): Clicks "Call" Button
    Agent (UI)->>+Agent (UI): handleCall()

    %% --- Start Call Logic (If/Else) ---
    alt type === 'generate'
        Agent (UI)->>+Vapi: start(workflowId, { variableValues })
    else type !== 'generate'
        Agent (UI)-->>Agent (UI): Format questions ## Internal step
        Agent (UI)->>+Vapi: start(interviewer, { variableValues })
    end
    %% --- End Start Call Logic ---

    Agent (UI)->>Agent (UI): setCallStatus(CONNECTING)
    Vapi-->>-Agent (UI): Returns (Promise resolves) ## Deactivates Vapi start step
    Agent (UI)--)-Agent (UI): ## Deactivates handleCall execution context
    Note right of Vapi: Vapi connects asynchronously...

    Vapi->>+Agent (UI): Emits "call-start" event
    Agent (UI)->>Agent (UI): onCallStart() callback
    Agent (UI)->>Agent (UI): setCallStatus(ACTIVE)
    Agent (UI)--)-Agent (UI): ## Deactivates onCallStart callback execution
    Note over Vapi, Agent (UI): Call is active, interaction proceeds...

    loop Speech Events
        Vapi->>+Agent (UI): Emits "speech-start" event
        Agent (UI)->>Agent (UI): onSpeechStart() callback
        Agent (UI)->>Agent (UI): setIsSpeaking(true)
        Agent (UI)--)-Agent (UI): ## Deactivates onSpeechStart callback execution

        Vapi->>+Agent (UI): Emits "speech-end" event
        Agent (UI)->>Agent (UI): onSpeechEnd() callback
        Agent (UI)->>Agent (UI): setIsSpeaking(false)
        Agent (UI)--)-Agent (UI): ## Deactivates onSpeechEnd callback execution
    end

    loop Message Events
        Vapi->>+Agent (UI): Emits "message" event (transcript)
        Agent (UI)->>Agent (UI): onMessage() callback
        Agent (UI)->>Agent (UI): setMessages([...messages, newMessage])
        Agent (UI)--)-Agent (UI): ## Deactivates onMessage callback execution
    end

    User->>+Agent (UI): Clicks "End" Button
    Agent (UI)->>+Agent (UI): handleDisconnect()
    Agent (UI)->>+Vapi: stop()
    Agent (UI)->>Agent (UI): setCallStatus(FINISHED) ## Set status immediately
    Vapi-->>-Agent (UI): Returns ## Deactivates Vapi stop step
    Agent (UI)--)-Agent (UI): ## Deactivates handleDisconnect execution context

    Note over Vapi, Agent (UI): Vapi SDK might emit "call-end" shortly after stop() is called

    Vapi->>+Agent (UI): Emits "call-end" event
    Agent (UI)->>Agent (UI): onCallEnd() callback
    Agent (UI)->>Agent (UI): setCallStatus(FINISHED) ## Handles SDK event
    Agent (UI)--)-Agent (UI): ## Deactivates onCallEnd callback execution

    Note over Agent (UI): useEffect triggered by callStatus === FINISHED

    %% --- Feedback/Navigation Logic (If/Else) ---
    alt type !== 'generate'
        Agent (UI)->>+Agent (UI): handleGenerateFeedback(messages)
        Agent (UI)->>+ServerAction: createFeedback({ interviewId, userId, transcript, feedbackId })
        ServerAction-->>-Agent (UI): Returns { success, feedbackId } ## Return from server action

        %% --- Nested If/Else for Navigation ---
        alt success and feedbackId exists
           Agent (UI)->>+Router: push(`/interview/${interviewId}/feedback`)
           Router-->>-Agent (UI): Navigates ## Navigation completes
        else Error or no ID
           Agent (UI)->>+Router: push('/')
           Router-->>-Agent (UI): Navigates ## Navigation completes
        end
        %% --- End Nested Navigation Logic ---

        Agent (UI)--)-Agent (UI): ## Deactivates handleGenerateFeedback execution context
    else type === 'generate'
        Agent (UI)->>+Router: push('/')
        Router-->>-Agent (UI): Navigates ## Navigation completes
    end
    %% --- End Feedback/Navigation Logic ---

```

## Challenges Faced

*   **Real-time State Sync:** Managing and synchronizing the UI state (call status, transcript, speaking indicator) with asynchronous events from the Vapi SDK required careful handling of React state and effects.
*   **SDK Integration:** Correctly initializing, handling events (call start/end, messages, speech start/end, errors), and cleaning up listeners for the Vapi SDK within the React component lifecycle.
*   **Error Handling:** Implementing robust error handling for potential issues during the call (e.g., connection problems, API errors).
*   **Asynchronous Flow:** Orchestrating asynchronous operations like starting the call, receiving messages, and triggering feedback generation upon call completion.
*   **UI/UX for Voice:** Designing an intuitive interface for a primarily voice-driven interaction.

## Lessons Learned

*   **State Management in Real-time Apps:** The importance of robust state management (like `useState`, `useEffect`) for handling asynchronous events and maintaining UI consistency.
*   **Third-Party SDKs:** Best practices for integrating and managing the lifecycle of external SDKs within a React/Next.js application.
*   **Event Handling:** Effective use of event listeners and cleanup functions to prevent memory leaks and unexpected behavior.
*   **Asynchronous Programming:** Deeper understanding of `async/await` and Promise handling in JavaScript/TypeScript for managing API calls and background processes.
*   **Component Design:** Structuring React components to encapsulate related logic and state (e.g., the `Agent` component managing the entire call flow).

---

