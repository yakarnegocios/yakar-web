#!/usr/bin/env bash
set -eu

# Evaluate the instant in Lima independently of the runner's time zone.
export LC_ALL=C
local_time=$(TZ=America/Lima date '+%u %H:%M')
read -r day time <<< "$local_time"

if [[ "$day" == 6 || "$day" == 7 ]] && [[ ! "$time" < "00:59" && "$time" < "04:30" ]]; then
  printf 'Ventana de publicación abierta (%s, Lima).\n' "$time"
  exit 0
fi

printf 'Ventana cerrada (%s, Lima). Publica el sábado o domingo entre las 00:59 y las 04:30.\n' "$time" >&2
exit 1
