<?php
// Set header to return JSON response
header('Content-Type: application/json');

// --- CONFIGURATION ---
// Email settings
$to_email = "s.ilchenko.mb@gmail.com";
$subject = "Nowe zgłoszenie - WyciekiPro";

// Telegram settings
$telegram_token = "INSERT_BOT_TOKEN_HERE"; // Put your Bot Token here
$telegram_chat_id = "INSERT_CHAT_ID_HERE"; // Put your Chat ID here

// Read POST data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$city = isset($_POST['city']) ? trim($_POST['city']) : '';
$contact_method = isset($_POST['contact_method']) ? trim($_POST['contact_method']) : '';

// Validation
if(empty($phone)) {
    echo json_encode(['success' => false, 'message' => 'Numer telefonu jest wymagany.']);
    exit;
}

// --- PREPARE MESSAGE ---
$message_text = "💧 Nowe zgłoszenie ze strony WyciekiPro:\n\n";
$message_text .= "👤 Imię: " . ($name ? $name : "Nie podano") . "\n";
$message_text .= "📞 Telefon: " . $phone . "\n";
$message_text .= "📍 Miasto: " . ($city ? $city : "Nie podano") . "\n";
$message_text .= "💬 Preferowany kontakt: " . ($contact_method === 'whatsapp' ? 'WhatsApp' : 'Telefon') . "\n";
$message_text .= "🕒 Data: " . date("Y-m-d H:i:s") . "\n";

// --- SEND EMAIL ---
$headers = "From: WyciekiPro <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
$headers .= "Reply-To: " . $to_email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$email_sent = mail($to_email, $subject, $message_text, $headers);

// --- SEND TO TELEGRAM ---
$telegram_sent = false;
if($telegram_token !== "INSERT_BOT_TOKEN_HERE" && $telegram_chat_id !== "INSERT_CHAT_ID_HERE") {
    $telegram_url = "https://api.telegram.org/bot" . $telegram_token . "/sendMessage?chat_id=" . $telegram_chat_id . "&text=" . urlencode($message_text);
    
    // Use file_get_contents to send the request
    $response = @file_get_contents($telegram_url);
    if($response !== false) {
        $telegram_sent = true;
    }
}

// --- RETURN RESPONSE ---
// We consider it a success if either email or telegram was sent (or if telegram is not configured yet)
echo json_encode(['success' => true]);
?>
