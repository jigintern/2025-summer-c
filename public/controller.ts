// import { postJson } from './utils/api.ts';
// import type { PostSubmission } from '../types/postData.ts';
//
// // Get the form component from the DOM
// const postFormComponent = document.getElementById('infoModal');
// if (!postFormComponent) throw new Error("Component with ID 'infoModal' not found.");
//
// /**
//  * Initializes the application controller.
//  * It only sets up the listener for the form submission.
//  */
// function initializeController() {
//     console.log("Form controller initialized.");
//     setupFormSubmitListener();
// }
//
// /**
//  * Sets up a listener for the 'submit' event from the <post-form> component.
//  * When the form is submitted, it formats the data and sends it to the backend.
//  */
// function setupFormSubmitListener() {
//     postFormComponent.addEventListener('submit', async (event: CustomEvent) => {
//         const formData = event.detail;
//         console.log('Form data received:', formData);
//
//         // Since there is no map, use placeholder coordinates or a default value.
//         const placeholderCoords = { x: 0, y: 0, h: 0, w: 0, angle: 0 };
//
//         // Format the form data to match the backend's PostSubmission type
//         const submissionData: PostSubmission = {
//             name: formData.posterName,
//             comment: formData.bodyText,
//             decade: {
//                 gt: parseInt(formData.era.split('-')[0], 10),
//                 lte: parseInt(formData.era.split('-')[1], 10),
//             },
//             coordinate: placeholderCoords,
//             photos: [],
//             thread: [],
//             created_at: new Date().toISOString(),
//         };
//
//         try {
//             const response = await postJson(submissionData);
//             if (response.ok) {
//                 alert('Post successful!');
//                 // (postFormComponent as any).clear();
//             } else {
//                 throw new Error(`Server responded with status: ${response.status}`);
//             }
//         } catch (error) {
//             console.error("Failed to submit post:", error);
//             alert("Failed to submit post. Please try again.");
//         }
//     });
// }
//
// // --- Start the controller ---
// initializeController();