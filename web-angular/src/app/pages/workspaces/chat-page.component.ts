import { Component, computed, effect, inject, signal, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { WorkspaceSessionService } from '../../services/workspace-session.service';
import { MarkdownComponent } from '../../components/shared/markdown.component';
import { AvatarComponent } from '../../components/ui/avatar.component';
import { SkeletonComponent } from '../../components/ui/skeleton.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { InputComponent } from '../../components/ui/input.component';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { IconComponent } from '../../components/shared/icon.component';
import { DateMediumPipe } from '../../pipes/format.pipe';
import type { WorkspaceMessage, WorkspaceSessionSummary } from '../../types/models';

const PROMPT_STARTERS = [
  'Summarize all uploaded materials in this workspace',
  'What are the main technical dependencies and architecture?',
  'Extract key action items and deployment steps',
  'Find security and authentication requirements',
];

interface ActiveSession {
  sessionId: string | null;
  sessionName: string | null;
  createdAt: string | null;
}

interface ParsedContent {
  type: 'text' | 'thinking';
  content: string;
}

function cleanMarkdownContent(content: string): string {
  return content
    .replace(/<\|im_start\|>\s*\n?/gi, '')
    .replace(/<\|endoftext\|>/gi, '')
    .replace(/<\|im_end\|>/gi, '')
    .trim();
}

function parseContent(content: string): ParsedContent[] {
  const thinkStart = '<think>';
  const thinkEnd = '</think>';
  const parts: ParsedContent[] = [];
  let lastIndex = 0;
  let startIdx = content.indexOf(thinkStart, lastIndex);

  while (startIdx !== -1) {
    const endIdx = content.indexOf(thinkEnd, startIdx + thinkStart.length);
    if (endIdx === -1) {
      break;
    }
    if (startIdx > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, startIdx) });
    }
    parts.push({ type: 'thinking', content: content.slice(startIdx + thinkStart.length, endIdx).trim() });
    lastIndex = endIdx + thinkEnd.length;
    startIdx = content.indexOf(thinkStart, lastIndex);
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts;
}

@Component({
  standalone: true,

  selector: 'app-chat-page',
  imports: [
    MarkdownComponent,
    AvatarComponent,
    SkeletonComponent,
    ButtonComponent,
    InputComponent,
    DashedPanelComponent,
    IconComponent,
    DateMediumPipe,
  ],
  template: `
    <div class="flex h-[calc(100dvh-57px)] w-full overflow-hidden">
      <aside class="flex w-72 shrink-0 flex-col gap-4 border-r border-border bg-muted/25 p-4 lg:w-80">
        <div class="flex items-center justify-between px-1">
          <h2 class="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">//sessions</h2>
          <button
            appButton variant="ghost" size="iconSm"
            (click)="newSession()"
            class="size-8 cursor-pointer hover:bg-brand/10 hover:text-brand-text"
            title="Start new session"
          >
            <app-icon name="Plus" class="size-4" />
          </button>
        </div>

        <div class="relative">
          <app-icon name="Search" class="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            appInput
            placeholder="Search sessions..."
            [value]="sessionSearch()"
            (input)="onSessionSearchInput($event)"
            class="h-9 rounded-md border-border bg-card pl-8.5 text-sm"
          />
        </div>

        <div class="flex-1 space-y-1 overflow-y-auto pr-1">
          @for (item of filteredSessions(); track item.id) {
            <div
              class="group flex w-full items-center border transition-all"
              [class]="
                activeSession().sessionId === item.id ?
                  'border-brand/40 bg-brand/[0.07]' :
                  'border-transparent bg-card hover:bg-muted/60'
              "
            >
              <button
                type="button"
                (click)="selectSession(item)"
                class="min-w-0 flex-1 cursor-pointer p-3 text-left"
              >
                <p class="truncate font-mono text-xs" [class.font-semibold]="activeSession().sessionId === item.id" [class.font-medium]="activeSession().sessionId !== item.id">
                  {{ item.name }}
                </p>
                <p class="mt-0.5 truncate text-[10px] text-muted-foreground">{{ item.created_at | dateMedium }}</p>
              </button>
              <button
                appButton variant="ghost" size="iconSm"
                class="mr-1.5 size-7 shrink-0 cursor-pointer text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                (click)="deleteSession(item.id, $event)"
                [disabled]="deleting()"
                title="Delete session"
              >
                <app-icon name="Trash2" class="size-3.5" />
              </button>
            </div>
          }

          @if (sessionsLoading()) {
            <div class="space-y-2">
              <app-skeleton class="h-14 w-full" />
              <app-skeleton class="h-14 w-full" />
            </div>
          }

          @if (filteredSessions().length === 0 && !sessionsLoading()) {
            <p class="py-8 text-center text-xs text-muted-foreground">No sessions found.</p>
          }
        </div>
      </aside>

      <div class="flex h-full min-w-0 flex-1 flex-col">
        <div #scrollContainer class="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
          @if (isLoadingMessages()) {
            <div class="mr-auto max-w-3xl space-y-4">
              <app-skeleton class="h-20 w-3/4" />
              <app-skeleton class="ml-auto h-14 w-2/3" />
              <app-skeleton class="h-28 w-3/4" />
            </div>
          }

          @if (!isLoadingMessages() && displayMessages().length === 0) {
            <div class="mx-auto max-w-2xl animate-in fade-in duration-300 py-12">
              <div class="space-y-3 text-center">
                <div class="mx-auto flex size-12 items-center justify-center bg-brand/10 font-mono text-sm font-semibold text-brand-text ring-1 ring-brand/20">
                  //ragify
                </div>
                <h3 class="text-xl font-semibold tracking-tight sm:text-2xl">Chat with your workspace</h3>
                <p class="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                  Ask anything about the documents indexed in this workspace. Ragify extracts relevant context chunks
                  with precise citations.
                </p>
              </div>

              <div class="mt-8 space-y-3">
                <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <app-icon name="Lightbulb" class="size-3.5 text-primary" />
                  Suggested questions
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  @for (starter of promptStarters; track starter) {
                    <app-dashed-panel class="bg-card">
                      <button
                        type="button"
                        (click)="promptStarter(starter)"
                        class="group flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left text-xs font-medium transition-all hover:bg-muted/30"
                      >
                        <span class="leading-relaxed">{{ starter }}</span>
                        <app-icon
                          name="ChevronRight"
                          class="size-3.5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand-text"
                        />
                      </button>
                    </app-dashed-panel>
                  }
                </div>
              </div>
            </div>
          }

          @for (message of displayMessages(); track message.id) {
            <div
              class="flex max-w-3xl animate-in fade-in gap-3 duration-200"
              [class.mr-auto]="message.role === 'assistant'"
              [class.ml-auto]="message.role !== 'assistant'"
              [class.flex-row-reverse]="message.role !== 'assistant'"
            >
              @if (message.role === 'assistant') {
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[10px] font-semibold text-brand-foreground">
                  //
                </div>
              } @else {
                <app-avatar
                  [image]="sessionService.user()?.image"
                  [alt]="sessionService.user()?.name ?? 'You'"
                  [fallback]="userInitial()"
                />
              }

              <div class="min-w-0 max-w-[85%] space-y-1.5">
                <div
                  class="border p-4 text-sm leading-relaxed"
                  [class]="
                    message.role === 'assistant' ?
                      'border-border bg-card' :
                      'border-brand/40 bg-brand font-medium text-brand-foreground'
                  "
                >
                  @for (part of parsed(message); track $index) {
                    @if (part.type === 'thinking') {
                      <div class="mb-3 border border-border/60 bg-muted/50 p-3">
                        <p class="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          [Thinking]
                        </p>
                        <div class="text-xs leading-relaxed text-muted-foreground italic">
                          <app-markdown [content]="part.content" />
                        </div>
                      </div>
                    } @else {
                      <app-markdown [content]="part.content" />
                    }
                  }
                </div>

                <button
                  type="button"
                  (click)="copyMessage(message)"
                  class="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  [class.ml-auto]="message.role !== 'assistant'"
                  title="Copy message"
                >
                  <app-icon [name]="copiedId() === message.id ? 'Check' : 'Copy'" class="size-3" [class.text-emerald-500]="copiedId() === message.id" />
                  <span>{{ copiedId() === message.id ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
            </div>
          }

          @if (queryPending()) {
            <div class="mr-auto flex max-w-3xl animate-pulse gap-3">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[10px] font-semibold text-brand-foreground">
                //
              </div>
              <div class="flex items-center gap-2 border border-border bg-card p-4 text-xs font-medium text-muted-foreground">
                <app-icon name="LoaderCircle" class="size-3.5 animate-spin text-brand-text" />
                <span class="font-mono">//[Thinking]</span>
                <span>Retrieving context and generating answer...</span>
              </div>
            </div>
          }
        </div>

        <form class="w-full border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6" (ngSubmit)="submitPrompt()">
          <div class="flex items-center gap-2 border border-border bg-card p-2 transition-all focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/20">
            <input
              appInput
              type="text"
              class="h-11 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
              [placeholder]="
                activeSession().sessionId ?
                  'Ask a follow-up question...' :
                  'Ask a question against your workspace documents...'
              "
              [value]="prompt()"
              (input)="onPromptInput($event)"
              [disabled]="queryPending()"
            />
            @if (queryPending()) {
              <button
                appButton type="button" size="icon" variant="pill"
                class="size-10 shrink-0 cursor-pointer rounded-full"
                (click)="stop()"
                title="Stop generating"
              >
                <app-icon name="Square" class="size-3.5 fill-current" />
              </button>
            } @else {
              <button
                appButton type="submit" size="icon" variant="pill"
                class="size-10 shrink-0 cursor-pointer rounded-full"
                [disabled]="!prompt().trim()"
                title="Send message"
              >
                <app-icon name="SendHorizonal" class="size-4" />
              </button>
            }
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ChatPageComponent implements AfterViewInit {
  protected readonly sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  private readonly toastService = inject(ToastService);
  private readonly workspaceSessionService = inject(WorkspaceSessionService);
  private readonly route = inject(ActivatedRoute);

  readonly promptStarters = PROMPT_STARTERS;
  readonly prompt = signal('');
  readonly sessionSearch = signal('');
  readonly copiedId = signal<string | null>(null);
  readonly activeSession = signal<ActiveSession>({ sessionId: null, sessionName: null, createdAt: null });
  readonly sessions = signal<WorkspaceSessionSummary[]>([]);
  readonly sessionsLoading = signal(false);
  readonly serverMessages = signal<WorkspaceMessage[]>([]);
  readonly messagesLoading = signal(false);
  readonly localMessages = signal<WorkspaceMessage[]>([]);
  readonly queryPending = signal(false);
  readonly deleting = signal(false);
  readonly workspaceId = signal('');
  readonly desiredSessionId = signal<string | null>(null);

  private readonly queryCancelled = new Subject<void>();
  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  readonly filteredSessions = computed(() => {
    const term = this.sessionSearch().toLowerCase().trim();
    if (!term) {
      return this.sessions();
    }
    return this.sessions().filter((session) => session.name.toLowerCase().includes(term));
  });

  readonly displayMessages = computed(() => {
    const serverMessageKeys = new Set(
      this.serverMessages().map((message) => `${message.role}:${message.content}`),
    );
    return [
      ...this.serverMessages(),
      ...this.localMessages().filter(
        (message) => message.id.startsWith('local-') && !serverMessageKeys.has(`${message.role}:${message.content}`),
      ),
    ];
  });

  readonly isLoadingMessages = computed(
    () => this.messagesLoading() && this.displayMessages().length === 0,
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.workspaceId.set(params.get('workspaceId') ?? '');
      const stored = this.workspaceSessionService.read(this.workspaceId());
      this.activeSession.set({
        sessionId: stored.sessionId,
        sessionName: stored.sessionName,
        createdAt: stored.createdAt,
      });
      this.localMessages.set([]);
      this.loadSessions();
      if (stored.sessionId) {
        this.loadMessages(stored.sessionId);
      } else {
        this.serverMessages.set([]);
      }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.desiredSessionId.set(params.get('session'));
    });

    effect(() => {
      const id = this.workspaceId();
      if (id) {
        this.loadSessions();
      }
    });

    effect(() => {
      const desired = this.desiredSessionId();
      if (!desired || desired === this.activeSession().sessionId) {
        return;
      }
      const match = this.sessions().find((session) => session.id === desired);
      if (match) {
        this.selectSession(match);
      }
    });

    effect(() => {
      void this.displayMessages();
      void this.queryPending();
      this.scrollToBottom();
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  userInitial(): string {
    return this.sessionService.user()?.name?.charAt(0)?.toUpperCase() || 'U';
  }

  onSessionSearchInput(event: Event): void {
    this.sessionSearch.set((event.target as HTMLInputElement).value);
  }

  onPromptInput(event: Event): void {
    this.prompt.set((event.target as HTMLInputElement).value);
  }

  parsed(message: WorkspaceMessage): ParsedContent[] {
    return parseContent(cleanMarkdownContent(message.content));
  }

  private loadSessions(): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.sessionsLoading.set(true);
    this.apiService.sessions(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.sessions.set(Array.isArray(data) ? data : []);
        this.sessionsLoading.set(false);
      },
      error: () => this.sessionsLoading.set(false),
    });
  }

  private loadMessages(sessionId: string): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.messagesLoading.set(true);
    this.apiService.sessionMessages(token, id, sessionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.serverMessages.set(
          (Array.isArray(response?.messages) ? response.messages : []).map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt || new Date().toISOString(),
          })),
        );
        this.messagesLoading.set(false);
      },
      error: () => this.messagesLoading.set(false),
    });
  }

  selectSession(item: WorkspaceSessionSummary): void {
    this.activeSession.set({ sessionId: item.id, sessionName: item.name, createdAt: item.created_at });
    this.localMessages.set([]);
    this.workspaceSessionService.write(this.workspaceId(), {
      sessionId: item.id,
      sessionName: item.name,
      createdAt: item.created_at,
      messages: [],
    });
    this.loadMessages(item.id);
  }

  newSession(): void {
    this.activeSession.set({ sessionId: null, sessionName: null, createdAt: null });
    this.localMessages.set([]);
    this.serverMessages.set([]);
    this.workspaceSessionService.write(this.workspaceId(), {
      sessionId: null,
      sessionName: null,
      createdAt: null,
      messages: [],
    });
  }

  deleteSession(sessionId: string, event: Event): void {
    event.stopPropagation();
    if (!sessionId) {
      return;
    }
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      const token = this.sessionService.session()?.accessToken;
      const id = this.workspaceId();
      if (!token || !id) {
        return;
      }
      this.deleting.set(true);
      this.apiService.deleteSession(token, id, sessionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.sessions.update((current) => current.filter((session) => session.id !== sessionId));
          if (this.activeSession().sessionId === sessionId) {
            this.newSession();
          }
          this.deleting.set(false);
          this.toastService.success('Chat session deleted');
        },
        error: (error: Error) => {
          this.toastService.error(error.message || 'Failed to delete session');
          this.deleting.set(false);
        },
      });
    }
  }

  submitPrompt(): void {
    const trimmed = this.prompt().trim();
    if (!trimmed) {
      return;
    }
    this.sendQuery(trimmed);
  }

  promptStarter(starter: string): void {
    this.sendQuery(starter);
  }

  private sendQuery(query: string): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      this.toastService.error('Workspace session is unavailable');
      return;
    }

    const userMessage = this.workspaceSessionService.createMessage('user', query);
    userMessage.id = `local-${userMessage.id}`;
    this.localMessages.update((current) => [...current, userMessage]);
    this.prompt.set('');
    this.queryPending.set(true);

    this.apiService
      .query(token, id, { session_id: this.activeSession().sessionId, query })
      .pipe(takeUntil(this.queryCancelled), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const assistantMessage = this.workspaceSessionService.createMessage('assistant', data.answer);
          assistantMessage.id = `local-${assistantMessage.id}`;
          this.localMessages.update((current) => [...current, assistantMessage]);
          this.activeSession.set({
            sessionId: data.session_id,
            sessionName: data.session_name,
            createdAt: data.created_at,
          });
          this.workspaceSessionService.write(id, {
            sessionId: data.session_id,
            sessionName: data.session_name,
            createdAt: data.created_at,
            messages: [],
          });
          this.queryPending.set(false);
          this.loadSessions();
        },
        error: (error: Error) => {
          if (error.name === 'AbortError') {
            return;
          }
          this.localMessages.update((current) =>
            current.filter(
              (message) =>
                !(message.id.startsWith('local-') && message.role === 'user' && message.content === query),
            ),
          );
          this.toastService.error(error.message);
          this.queryPending.set(false);
        },
      });
  }

  stop(): void {
    this.queryCancelled.next();
    this.queryPending.set(false);
  }

  copyMessage(message: WorkspaceMessage): void {
    void navigator.clipboard.writeText(message.content);
    this.copiedId.set(message.id);
    this.toastService.success('Message copied to clipboard');
    setTimeout(() => this.copiedId.set(null), 2000);
  }
}
