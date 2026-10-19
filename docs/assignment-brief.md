# Take-Home Assignment: Build a Calculator Web App with an AI Coding Tool

*KnowledgeCity, Technology Division*

## About this assignment

Thank you for your interest in joining KnowledgeCity. Our product software is built with AI coding tools, and the people in product and delivery roles direct that work: they decide who a product is for, define what it must do, and check that what the AI builds is correct. This assignment asks you to do the same on a small scale.

You will build a calculator web application with an AI coding tool and send us three things: the working source code, the transcript of your session with the AI tool, and a short set of product documents. The code shows us the result, the transcript shows us how you got there, and the documents show us how you think about users and requirements.

Plan for about 2 to 4 hours. A small app that works and is well specified is worth more to us than a large one that does not.

## The task

Build a calculator that runs in a web browser, using an AI coding tool to write the code.

The kind of calculator is your choice: a basic arithmetic calculator, a scientific calculator, a loan or mortgage calculator, a tip and bill splitter, or anything else that calculates. Deciding who it is for and what problem it solves is part of the assignment, so state your choice and your reasons in the README.

### Requirements

- It runs in a current version of Chrome, Edge, Firefox or Safari.

- A reviewer can start it on their own computer by following your README, with no paid accounts, API keys or cloud services. A public URL where the app is already running is welcome in addition to this, not instead of it.

- Any programming language, framework or library is fine.

- Every user story you mark as Implemented works in the running app exactly as its acceptance criteria describe.

- Invalid input and error cases, such as division by zero, produce a clear message, never a crash or a wrong result.

### Using an AI coding tool

- Use any AI coding tool: Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Windsurf, Gemini CLI or similar.

- The AI tool writes the code. Your job is to direct it: explain the problem, give it the context it needs, review what it produces, test the result and correct it.

- If you change any code by hand, list those changes in the README.

- You may work across several sessions or several tools. Send the transcript of every session.

- You may use AI to help write the product documents too. You are responsible for their content and should be ready to explain any part of them.

## What to submit

### Source code

- The complete source code, without installed dependencies or build output (for example, leave out node_modules, virtual environments and dist folders).

- A README file in the root folder that covers: what the app is and who it is for; the prerequisites (for example, Node.js 20); the exact commands to install and start the app; how to run the tests, if you wrote any; which AI tool and model you used; any code you changed by hand; and any assumptions you made.

### Session transcript

The transcript is the full record of your conversation with the AI tool: your prompts exactly as you typed them and the tool's responses, from the first message to the last. It shows us how you work with AI, so it matters as much as the code.

- Export it with the tool's own export feature. In Claude Code, the /export command saves the conversation to a file, and session logs are also kept under ~/.claude/projects/. The OpenAI Codex CLI keeps session logs under ~/.codex/sessions/. Other tools usually have an export or copy option on the chat.

- Send the export as it is. A summary of the session, including one the AI tool writes for you at the end, does not count as the transcript.

- Before you send it, remove any passwords, API keys or tokens, and change nothing else.

### Product documents

Write three documents, in this order, because each one builds on the one before it.

| Document                                  | Answers                                 | Format of each entry                                                                                                                                                                  |
|-------------------------------------------|-----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **App Roles**                             | Who uses the app                        | "A \[role\] is \[who this person is and their situation\]. They can \[what they see and do in the app\]. They must never \[what the app must prevent\]", where the last part applies. |
| **Jobs To Be Done**                       | Why they use it                         | "When \[situation\], I want to \[motivation\], so I can \[expected outcome\]." Each job names the role it belongs to.                                                                 |
| **User Stories with Acceptance Criteria** | How the app helps them get the job done | "As a \[role\], I want \[capability\], so that \[benefit\]." Each story names the job it serves and has acceptance criteria and a status.                                             |

- **App Roles.** A calculator may have one role or several. Either is fine, as long as each role describes a real kind of person and explains how their needs differ from the other roles.

- **Jobs To Be Done.** A job describes what the person needs to get done whether or not your app exists, so it does not mention your app or its features. If a job cannot be written without naming a button or a screen, it is a feature, not a job.

- **User Stories.** Every story names the job it serves, and every job names the role it belongs to. A story that serves no job does not belong in the list.

- **Acceptance criteria.** Write specific, testable statements of how the app behaves, preferably as "Given \[starting state\], when \[action\], then \[observable result\]". Cover the normal case and the cases where things go wrong: invalid input, boundary values, very large or very small numbers, and what happens when the user carries on after a result or an error.

- **Status.** Mark each story Implemented or Not implemented, based on what the app does today. Stories you would build next are welcome, marked Not implemented.

Markdown, PDF, Word or Google Docs are all fine. Put the files in a docs folder, or link to them from the README.

### Example of the format

This example uses a meeting room booking app, so it does not overlap with your calculator.

- **App Role.** "An Office Employee is a staff member who books rooms for their own meetings. They can see which rooms are free and see their own bookings. They can create and cancel their own bookings. They must never cancel another person's booking."

- **Job J-1 (Office Employee).** "When I need to meet colleagues in person, I want to secure a suitable space in advance, so I can hold the meeting without searching for a free room on the day."

- **User Story S-1 (serves J-1, Implemented).** "As an Office Employee, I want to see which rooms are free at a time I choose, so that I can book one without checking each room."

  - Given rooms A and B are free from 10:00 to 11:00 and room C is booked, when I search for 10:00 to 11:00, then I see rooms A and B and I do not see room C.

  - Given I enter an end time earlier than the start time, when I search, then I see the message "End time must be after the start time" and no rooms are listed.

## Packaging and sending

Organize the package like this (the layout of the source folder is up to you):

firstname-lastname-calculator/  
README.md  
src/  
docs/  
app-roles.md  
jobs-to-be-done.md  
user-stories.md  
transcripts/  
session-01.md

- When you receive this assignment, reply to confirm and tell us when you expect to submit.

- Email your submission to the HR contact who sent you this assignment, by the deadline in their email.

- Share the package as a link: a Google Drive folder or a Git repository on GitHub, GitLab or Bitbucket, open to anyone who has the link. Many email systems, Gmail included, block .zip attachments that contain code, so a link is more reliable than an attachment.

- Use the subject line: Take-home assignment: \[the role you applied for\], \[your full name\].

- In the email, include the link, the live URL if you deployed the app, the AI tools and models you used, and roughly how long you spent.

## How we review your submission

- **It works.** We follow your README on a clean computer and use the app the way one of your users would. Automated tests are welcome, and we still check the behavior by hand.

- **Product thinking.** The roles describe real people with different needs, the jobs are free of solutions, every story traces to a job, and the acceptance criteria are testable and cover error and edge cases.

- **Working with AI.** From the transcript: how you framed the problem, what context you gave the tool, how you checked its output, and which mistakes you caught and fixed.

- **Accuracy.** The documents and the README describe what was actually built. A story honestly marked Not implemented counts for more than an overstated claim.

- **Delivery and communication.** You told us when to expect your submission and delivered by then, and the package is clear and easy to review.

Be ready to walk us through your submission and explain your decisions in a follow-up conversation.

## Questions

If anything in this assignment is unclear, ask your HR contact. You can also make a reasonable assumption and write it down in the README. How you handle open questions is part of what we look at.
