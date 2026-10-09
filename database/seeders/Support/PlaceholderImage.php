<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Generates labelled placeholder images on the public disk so seeded
 * records (vehicle photos, IDs, receipts, QR codes) have real files behind them.
 */
class PlaceholderImage
{
    private const BRAND_RED = [215, 25, 32];
    private const CHARCOAL = [27, 31, 34];

    public static function vehiclePhoto(string $dir, string $title, string $subtitle, int $shot): string
    {
        $palette = [[54, 60, 64], [85, 93, 98], [125, 133, 138]];

        return self::make(
            "{$dir}/photo-{$shot}.jpg",
            $title,
            [$subtitle, "Sample photo {$shot}"],
            $palette[($shot - 1) % 3],
            [255, 255, 255],
            1200,
            800,
        );
    }

    public static function document(string $path, string $title, array $lines = []): string
    {
        return self::make($path, $title, $lines, [244, 245, 246], self::CHARCOAL, 1000, 640);
    }

    public static function qrCode(string $path, string $label): string
    {
        $size = 600;
        $img = imagecreatetruecolor($size, $size);
        $white = imagecolorallocate($img, 255, 255, 255);
        $black = imagecolorallocate($img, ...self::CHARCOAL);
        imagefill($img, 0, 0, $white);

        // Deterministic pseudo-QR pattern; it is not scannable on purpose.
        mt_srand(crc32($label));
        $cell = 20;
        for ($y = 60; $y < 480; $y += $cell) {
            for ($x = 60; $x < 540; $x += $cell) {
                if (mt_rand(0, 1)) {
                    imagefilledrectangle($img, $x, $y, $x + $cell - 1, $y + $cell - 1, $black);
                }
            }
        }
        foreach ([[60, 60], [400, 60], [60, 340]] as [$fx, $fy]) {
            imagefilledrectangle($img, $fx, $fy, $fx + 139, $fy + 139, $black);
            imagefilledrectangle($img, $fx + 20, $fy + 20, $fx + 119, $fy + 119, $white);
            imagefilledrectangle($img, $fx + 40, $fy + 40, $fx + 99, $fy + 99, $black);
        }
        mt_srand();

        self::text($img, $label, 505, 2, $black, $size);
        self::text($img, 'SAMPLE - NOT PAYABLE', 555, 2, imagecolorallocate($img, ...self::BRAND_RED), $size);

        return self::save($img, $path);
    }

    private static function make(string $path, string $title, array $lines, array $bg, array $fg, int $w, int $h): string
    {
        $img = imagecreatetruecolor($w, $h);
        imagefill($img, 0, 0, imagecolorallocate($img, ...$bg));
        $ink = imagecolorallocate($img, ...$fg);

        imagefilledrectangle($img, 0, 0, $w, 18, imagecolorallocate($img, ...self::BRAND_RED));

        self::text($img, $title, (int) ($h * 0.38), 4, $ink, $w);
        $y = (int) ($h * 0.38) + 90;
        foreach ($lines as $line) {
            self::text($img, $line, $y, 2, $ink, $w);
            $y += 48;
        }
        self::text($img, 'AUTO CDO Car Trading', $h - 60, 2, $ink, $w);

        return self::save($img, $path);
    }

    // GD's built-in font is tiny, so draw it small and scale it up.
    private static function text($img, string $text, int $y, int $scale, int $color, int $canvasWidth): void
    {
        $font = 5;
        $tw = imagefontwidth($font) * strlen($text);
        $th = imagefontheight($font);

        $tmp = imagecreatetruecolor($tw, $th);
        imagealphablending($tmp, false);
        $clear = imagecolorallocatealpha($tmp, 0, 0, 0, 127);
        imagefill($tmp, 0, 0, $clear);
        imagesavealpha($tmp, true);
        imagestring($tmp, $font, 0, 0, $text, $color);

        $dw = $tw * $scale;
        $dh = $th * $scale;
        imagealphablending($img, true);
        imagecopyresampled($img, $tmp, (int) (($canvasWidth - $dw) / 2), $y, 0, 0, $dw, $dh, $tw, $th);
        imagedestroy($tmp);
    }

    private static function save($img, string $path): string
    {
        ob_start();
        str_ends_with($path, '.png') ? imagepng($img) : imagejpeg($img, null, 82);
        $bytes = ob_get_clean();
        imagedestroy($img);

        Storage::disk('public')->put($path, $bytes);

        return $path;
    }
}
