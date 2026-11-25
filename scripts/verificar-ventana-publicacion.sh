#!/usr/bin/env bash
set -eu

# Evaluate the instant in Lima independently of the runner's time zone.
export LC_ALL=C
time=$(TZ=America/Lima date '+%H:%M')

if [[ ! "$time" < "01:00" && "$time" < "04:00" ]]; then
  printf 'Ventana de publicación abierta (%s, Lima).\n' "$time"
  exit 0
fi

printf 'Ventana cerrada (%s, Lima). La ventana diaria es de 01:00 a 04:00.\n' "$time" >&2
exit 1
