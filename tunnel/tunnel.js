const ngrok = require('ngrok');
(async function() {
    await ngrok.authtoken('3q5fBxwpYJgbvBVKz3wVR_3YZsMPw3AqyMv1dx6KbcL');
    const url = await ngrok.connect(3000);
})();