Phase 1 Features (improvements to canvas/Lookbooks):

- support ability to right click an object and change properties of the object (color, height, width, etc other properties that it already has)
- support ability to duplicate an object as one of our objectServices 
- support undo/redo last action with keyboard shortcuts (ctrl + z / ctrl + y)
- support copy/paste of objects with keyboard shortcuts (ctrl + c to copy an object, ctrl + y to paste an object elsewhere)
- support layer management of objections on the canvas/lookbook (use a toolbar that shows the layers, can toggle visible / not visible with a little eye icon)
- support multi-object selection by using keyboard shortcut ctrl while selecting objects one at a time with the mouse 

phase 2 Features - adding myLookBooks:
- support ability to save a Lookbook, open a Lookbook, and rename them. We should add a feature called mylookbooks and ensure it's vertically sliced in its own directory in /features. add a page and appropriate routing for users to see saved Lookbooks and ability to open a Lookbook from that page. default to this page when a user logs in. the page should be called My Lookbooks and function similar to a like a project repository
- support ability for users to share Lookbooks (a LookBook is a shared canvas between users - users can add each other to Lookbooks; user who creates the LookBook is the Owner and the only person who can remove other users from a Lookbook) 
- support text formatting (ability to resize the text; default sizes for Header, Subheading, and Paragraph text) and ability to rotate text. think very hard about what approaches to use to implement the text formatting - whether it's via canvas objects or on an html layer like we did for cursors 

Phase 3 features - ai agent enhancements and getting the app production-ready:
- support ability for ai-agent to create any number of shapes at one time - if user specifies to create 100 rectangles, it should create 100 rectangles 
-  support 1 complex command with the AI agent: "Space these elements evenly" -> takes elements selected by the user and spaces them out evenly. Assume the user wants them spaced horizontally. If <2 objects selected by the user, ask the user to select the objects they'd like to space and then say Done when they've done so -> validate selection again then execute by making the elements all be the same distance from each other
- support 2 complex commands (break these into 2 separate feature PRDs)-> 1) User selects a few shapes and asks ai agent to "Arrange these horizontally / vertically"  2) User tells the ai agent: ""Make a styleguide with Theme, Guidelines, and Description" -> ai agent creates a styleguide object (it's a rectangle w/ text inside for Theme (header text), Guidelines (subheading text), and Description (paragraph text)) - the intent behind this is for any user to have clear guidelines for the lookbook that are above the canvas area for them to stay creatively-constrained/focused
just needs to work with a simple implementation; does not need to handle ambiguity; must arrange 2-3 elements; elements created but not arrange"
- validate shared state works with multiple users using the AI agent at the same time / no conflicts / separate chat-memory for each user in the ai agent
- improve UX for AI Agent chat - fix the condensed chat window
- security: no exposed credentials, protected routes, proper session handling, robust auth, secure user mgmt
- support user state management where if a user is making edits and disconnects, they don't get kicked out of the app but are minimally notified they are disconnected but can still make a few edits and they are saved in their localstorage or other better option for this and then updates are pushed when they reconnect; network disconnect/reconnect should be handled gracefully; if a user disconnects it should be clear on other users' screens they are no longer online (or show a disconnected sign for 30s until it just removes them as no longer online); ensure reconnection doesnt require manual refresh 
- document conflict resolution strategy if its not already documented (double check the repo it probably already is)
- improve app entire UX (ask user to provide design inspo for this)


- testing / validation: (check our Requirements.md file for ideas here - ask user to verify what we want to test based on their spreadsheet and they will assist with testing plan). definitely validate app supports 5+ users with 100+ objects and definitely validate the ai commands are working. its ok if some lag under heavy load (>100 objects, 5+ users). definitely test conflict resolution between users, test network disconnection state management (of objects being created)

Must Have all of Phase 1 and Phase 2 validated and working to pass this challenge

- Phase 4: TBD (some items we'll handle here: adding google auth for signup/login. rename features/modules as needed for the rebrand. also: ability to drag images into a LookBook and it becomes an object; more layer management: support ability to bring an object to front or send to back by right clicking on an object)