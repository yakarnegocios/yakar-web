#!/usr/bin/env bash
set -eu

export LC_ALL=C
time=$(TZ=America/Lima date '+%H:%M')

if [[ ! "$time" < "01:00" && "$time" < "04:00" ]]; then
  printf 'Ventana de publicación abierta (%s, Lima).\n' "$time"
  exit 0
fi

printf 'Ventana cerrada (%s, Lima). Publica entre las 01:00 y antes de las 04:00, cualquier día.\n' "$time" >&2
exit 1
