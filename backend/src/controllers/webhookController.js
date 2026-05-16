const { Webhook } = require('svix');

const {
  createClerkClient,
} = require('@clerk/backend');

const clerkClient =
  createClerkClient({
    secretKey:
      process.env.CLERK_SECRET_KEY,
  });

const userService =
  require('../services/userService');

const handleClerkWebhook =
  async (req, res) => {
    const WEBHOOK_SECRET =
      process.env
        .CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      return res
        .status(500)
        .json({
          message:
            'Webhook secret not configured.',
        });
    }

    const svix_id =
      req.headers['svix-id'];

    const svix_timestamp =
      req.headers[
        'svix-timestamp'
      ];

    const svix_signature =
      req.headers[
        'svix-signature'
      ];

    if (
      !svix_id ||
      !svix_timestamp ||
      !svix_signature
    ) {
      return res
        .status(400)
        .json({
          message:
            'Missing svix headers.',
        });
    }

    let payload;

    try {
      const wh =
        new Webhook(
          WEBHOOK_SECRET
        );

      payload = wh.verify(
        req.body,
        {
          'svix-id':
            svix_id,

          'svix-timestamp':
            svix_timestamp,

          'svix-signature':
            svix_signature,
        }
      );
    } catch {
      return res
        .status(400)
        .json({
          message:
            'Invalid webhook signature.',
        });
    }

    const { type, data } =
      payload;

    if (
      type ===
        'user.created' ||
      type ===
        'user.updated'
    ) {
      const email =
        data.email_addresses?.[0]
          ?.email_address ||
        '';

      try {
        if (
          !userService.isAllowedEmail(
            email
          )
        ) {
          console.log(
            'Deleting unauthorized:',
            email
          );

          await clerkClient.users.deleteUser(
            data.id
          );

          console.warn(
            `Deleted unauthorized user: ${email}`
          );

          return res
            .status(200)
            .json({
              deleted: true,
            });
        }

        await userService.upsertUserFromClerk(
          {
            clerkId:
              data.id,

            email,

            firstName:
              data.first_name ||
              '',

            lastName:
              data.last_name ||
              '',
          }
        );
      } catch (err) {
        console.error(err);

        return res
          .status(500)
          .json({
            message:
              err.message,
          });
      }
    }

    res.status(200).json({
      received: true,
    });
  };

module.exports = {
  handleClerkWebhook,
};