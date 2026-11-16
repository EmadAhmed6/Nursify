/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Global Public Chat Room for Nursing Students
 */

/**
 * @swagger
 * /chat/messages:
 *   get:
 *     summary: Get recent public chat messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to return (max 100)
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fetch messages created before this timestamp
 *     responses:
 *       200:
 *         description: List of public chat messages
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Send a public chat message to the global room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Hello nursing colleagues, does anyone have the pharmacology summary?
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Content cannot be empty
 *       401:
 *         description: Unauthorized
 */
