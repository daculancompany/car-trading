<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * MESSAGES
     *
     * FLOW:
     *
     * Customer:
     * - Can send a message to the Secretary.
     * - Can view their conversation with the Secretary.
     *
     * Secretary:
     * - Can view customer conversations.
     * - Can reply to customers.
     *
     * Only Customer and Secretary can use messaging.
     */

    /**
     * Display messages.
     *
     * CUSTOMER:
     * Returns their conversation with the Secretary.
     *
     * SECRETARY:
     * Returns all customer-secretary messages.
     *
     * GET /api/messages
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('role');

        if ($this->isCustomer($user)) {
            $messages = Message::with([
                'sender',
                'receiver',
                'sender.customer',
                'receiver.customer',
            ])
                ->where(function ($query) use ($user) {
                    $query
                        ->where('sender_user_id', $user->id)
                        ->orWhere('receiver_user_id', $user->id);
                })
                ->where(function ($query) {
                    $query
                        ->whereHas('sender.role', function ($query) {
                            $query->where('role_type', 'customers');
                        })
                        ->whereHas('receiver.role', function ($query) {
                            $query->where('name', 'Secretary');
                        })
                        ->orWhere(function ($query) {
                            $query
                                ->whereHas('sender.role', function ($query) {
                                    $query->where('name', 'Secretary');
                                })
                                ->whereHas('receiver.role', function ($query) {
                                    $query->where('role_type', 'customers');
                                });
                        });
                })
                ->orderBy('sent_at', 'asc')
                ->get();

            return response()->json([
                'message' => 'Messages retrieved successfully.',
                'data' => $messages,
            ], 200);
        }

        if ($this->isSecretary($user)) {
            $messages = Message::with([
                'sender',
                'receiver',
                'sender.customer',
                'receiver.customer',
            ])
                ->where(function ($query) {
                    $query
                        ->whereHas('sender.role', function ($query) {
                            $query->where('name', 'Secretary');
                        })
                        ->whereHas('receiver.role', function ($query) {
                            $query->where('role_type', 'customers');
                        })
                        ->orWhere(function ($query) {
                            $query
                                ->whereHas('sender.role', function ($query) {
                                    $query->where('role_type', 'customers');
                                })
                                ->whereHas('receiver.role', function ($query) {
                                    $query->where('name', 'Secretary');
                                });
                        });
                })
                ->latest('sent_at')
                ->get();

            return response()->json([
                'message' => 'Messages retrieved successfully.',
                'data' => $messages,
            ], 200);
        }

        return response()->json([
            'message' => 'Only customers and secretaries can access messages.',
        ], 403);
    }

    /**
     * Display a conversation.
     *
     * Customer:
     * - Can open their own conversation with a Secretary.
     *
     * Secretary:
     * - Can open a conversation with a specific customer.
     *
     * GET /api/messages/conversation/{user}
     */
    public function conversation(
        Request $request,
        User $user
    ): JsonResponse {
        $authUser = $request->user()->loadMissing('role');

        // Customer
        // Customer can only open a conversation with a Secretary.

        if ($this->isCustomer($authUser)) {

            if (!$this->isSecretary($user)) {
                return response()->json([
                    'message' => 'Customers can only message the Secretary.',
                ], 403);
            }

            return $this->getConversation(
                $authUser->id,
                $user->id
            );
        }

        // Secretary
        // Secretary can open any customer's conversation.

        if ($this->isSecretary($authUser)) {

            if (!$this->isCustomer($user)) {
                return response()->json([
                    'message' => 'The selected user is not a customer.',
                ], 403);
            }

            return $this->getConversation(
                $user->id,
                $authUser->id
            );
        }

        return response()->json([
            'message' => 'Only customers and secretaries can access messages.',
        ], 403);
    }

    /**
     * Send a new message.
     *
     * Customer:
     * - Can send to Secretary.
     *
     * Secretary:
     * - Can reply to Customer.
     *
     * POST /api/messages
     */
    public function store(Request $request): JsonResponse
    {
        $sender = $request->user()->loadMissing('role');

        if (!$this->isCustomer($sender) && !$this->isSecretary($sender)) {
            return response()->json([
                'message' => 'Only customers and secretaries can send messages.',
            ], 403);
        }

        $validated = $request->validate([
            'message' => [
                'required',
                'string',
                'max:5000',
            ],

            'receiver_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],
        ]);

        // Initialize receiver
        $receiver = null;

        // CUSTOMER → SECRETARY

        if ($this->isCustomer($sender)) {

            $receiver = User::with('role')
                ->where('is_active', true)
                ->whereHas('role', function ($query) {
                    $query->where('name', 'Secretary');
                })
                ->first();

            if (!$receiver) {
                return response()->json([
                    'message' => 'No active Secretary is currently available.',
                ], 503);
            }
        }

        // SECRETARY → CUSTOMER

        if ($this->isSecretary($sender)) {

            if (empty($validated['receiver_user_id'])) {
                return response()->json([
                    'message' => 'The customer ID is required when replying to a customer.',
                ], 422);
            }

            $receiver = User::with('role')
                ->find($validated['receiver_user_id']);

            if (!$receiver) {
                return response()->json([
                    'message' => 'Customer not found.',
                ], 404);
            }

            if (!$this->isCustomer($receiver)) {
                return response()->json([
                    'message' => 'The selected user is not a customer.',
                ], 403);
            }
        }

        // Safety Check

        if (!$receiver) {
            return response()->json([
                'message' => 'Unable to determine message recipient.',
            ], 422);
        }

        // Create Message

        $message = Message::create([
            'sender_user_id' => $sender->id,
            'receiver_user_id' => $receiver->id,
            'message' => $validated['message'],
            'is_read' => false,
            'sent_at' => now(),
        ]);

        $message->load([
            'sender',
            'receiver',
            'sender.customer',
            'receiver.customer',
        ]);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => $message,
        ], 201);
    }

    /**
     * Mark a message as read.
     *
     * Only the receiver can mark a message as read.
     *
     * PATCH /api/messages/{message}/read
     */
    public function markAsRead(
        Request $request,
        Message $message
    ): JsonResponse {
        $user = $request->user()->loadMissing('role');

        if (!$this->isCustomer($user) && !$this->isSecretary($user)) {
            return response()->json([
                'message' => 'Only customers and secretaries can access messages.',
            ], 403);
        }

        // Make sure this is a Customer ↔ Secretary message

        if (!$this->isCustomerSecretaryMessage($message)) {
            return response()->json([
                'message' => 'This message does not belong to a customer-secretary conversation.',
            ], 403);
        }

        // Only receiver can mark as read

        if ((int) $message->receiver_user_id !== (int) $user->id) {
            return response()->json([
                'message' => 'Only the receiver can mark this message as read.',
            ], 403);
        }

        $message->update([
            'is_read' => true,
        ]);

        return response()->json([
            'message' => 'Message marked as read.',
            'data' => $message->fresh([
                'sender',
                'receiver',
                'sender.customer',
                'receiver.customer',
            ]),
        ], 200);
    }

    /**
     * PRIVATE HELPERS
     */

    /**
     * Get a conversation between a Customer and Secretary.
     */
    private function getConversation(
        int $customerId,
        int $secretaryId
    ): JsonResponse {
        $messages = Message::with([
            'sender',
            'receiver',
            'sender.customer',
            'receiver.customer',
        ])
            ->where(function ($query) use ($customerId, $secretaryId) {
                $query
                    ->where('sender_user_id', $customerId)
                    ->where('receiver_user_id', $secretaryId);
            })
            ->orWhere(function ($query) use ($customerId, $secretaryId) {
                $query
                    ->where('sender_user_id', $secretaryId)
                    ->where('receiver_user_id', $customerId);
            })
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json([
            'message' => 'Conversation retrieved successfully.',
            'data' => $messages,
        ], 200);
    }

    /**
     * Check if user is Secretary.
     */
    private function isSecretary(User $user): bool
    {
        return strtolower(
            $user->role?->name ?? ''
        ) === 'secretary';
    }

    /**
     * Check if user is Customer.
     */
    private function isCustomer(User $user): bool
    {
        return strtolower(
            $user->role?->role_type ?? ''
        ) === 'customers';
    }

    /**
     * Check if message belongs to Customer ↔ Secretary.
     */
    private function isCustomerSecretaryMessage(
        Message $message
    ): bool {
        $message->loadMissing([
            'sender.role',
            'receiver.role',
        ]);

        return (
            $this->isCustomer($message->sender) &&
            $this->isSecretary($message->receiver)
        ) || (
            $this->isSecretary($message->sender) &&
            $this->isCustomer($message->receiver)
        );
    }
}
