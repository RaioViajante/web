// Verified against x86-os-experiment e966889: src/main.asm and docs/01-boot-sector.md.
// Source comments omitted; instruction excerpts are unchanged.
export const sections = [
  {
    title: "entry/",
    code: "org 0x7C00\n\nbits 16\n\n%define ENDL 0x0D, 0x0A\n\nstart:\n    jmp main",
    explanation:
      "NASM is told to assemble 16-bit code with an origin of 0x7C00. The entry jumps to main; org describes the expected address rather than loading the code.",
  },
  {
    title: "initialization/",
    code: "main:\n    mov ax, 0\n    mov ds, ax\n    mov es, ax\n\n    mov ss, ax\n    mov sp, 0x7C00\n\n    mov si, msg_hello\n    call puts\n\n    hlt\n\n.halt:\n    jmp .halt",
    explanation:
      "The source initializes DS, ES, and SS to zero, sets SP to 0x7C00, points SI at the message, and calls puts. After printing, it reaches hlt and a loop before the data.",
  },
  {
    title: "print loop/",
    code: "puts:\n    push si\n    push ax\n\n.loop:\n    lodsb\n\n    or al, al\n    jz .done\n\n    mov ah, 0x0E\n    mov bh, 0x00\n    int 0x10\n\n    jmp .loop\n\n.done:\n    pop ax\n    pop si\n    ret",
    explanation:
      "The routine saves SI and AX, reads characters with lodsb, and stops at the zero terminator. BIOS interrupt 0x10 with AH = 0x0E prints each character. The saved registers are restored before returning.",
  },
  {
    title: "message/",
    code: "msg_hello: db 'Hello, World!', ENDL, 0",
    explanation:
      "The actual message is followed by ENDL (carriage return and line feed, defined in entry/) and a zero byte that terminates the string.",
  },
  {
    title: "sector ending/",
    code: "times 510 - ($ - $$) db 0\n\ndw 0xAA55",
    explanation:
      "NASM pads the sector with zero bytes up to offset 510, then writes the word 0xAA55. Its little-endian byte order is 55 AA. This explains the source directive; it is not a compiled byte dump.",
  },
];
